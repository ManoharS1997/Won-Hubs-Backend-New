
const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const formatDateToMySQLDateTime = require("../../helpers/formatDateString")
const jwt = require("jsonwebtoken");
const dagre = require("dagre");
const convertName = require('../../utils/convertName')

const createRelationRecord = async (req, res, next) => {
  try {
    const formData = req.body;
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }
    console.log('relation redord formData: ', formData);
    const payload = {}
    if (formData) {
      formData?.rel_name?.value !== undefined && formData?.rel_name?.value !== '' && (payload.rel_name = formData?.rel_name?.value);
      formData?.rel_description?.value !== undefined && formData?.rel_description?.value !== '' && (payload.rel_description = formData?.rel_description?.value);
      formData?.parent?.value !== undefined && formData?.parent?.value !== '' && (payload.parent = formData?.parent?.value);
      formData?.child?.value !== undefined && formData?.child?.value !== '' && (payload.child = formData?.child?.value);
      formData?.type?.value !== undefined && formData?.type?.value !== '' && (payload.type = formData?.type?.value);
      payload.sys_created_on = formatDateToMySQLDateTime(new Date().toISOString());
      payload.org_id = orgId;
      payload.active = '1';
    };

    if (!formData.rel_name) {
      return res.status(400).json({ message: "relation name is required." });
    }

    console.log('relation record payload: ', payload);

    // Build dynamic query based on payload keys
    const columns = Object.keys(payload);
    const values = Object.values(payload);

    if (columns.length === 0) {
      return res.status(400).json({ message: "No valid fields provided." });
    }

    const placeholders = columns.map(() => '?').join(', ');
    const query = `
      INSERT INTO cmdb_rel (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    const [result] = await db.execute(query, values);

    res.status(201).json({ success: true, message: "Relation Record created successfully." });
  } catch (err) {
    console.log('error creating Relation Record: ', err);
    res.status(500).json({ message: "Internal server error." });
  }
}

const getRelationRecord = async (req, res, next) => {
  try {
    const relationId = req.params.id;
    if (!relationId) {
      return res.status(400).json({ message: "Relation ID is required." });
    }

    const query = "SELECT * FROM cmdb_rel WHERE id = ? AND active = '1'";
    const values = [relationId];

    const [result] = await db.execute(query, values);

    if (result.length === 0) {
      return res.status(404).json({ message: "Relation not found." });
    }

    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error("Error fetching relation record:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

const getCIRelations = async (req, res, next) => {
  try {
    const ciId = req.params.id;
    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }
    if (!ciId) {
      return res.status(400).json({ message: "CI ID is required." });
    }

    const recursiveQuery = `
  WITH RECURSIVE ci_relations AS (
    SELECT parent, child, type
    FROM cmdb_rel
    WHERE (parent = ? OR child = ?) AND active = '1' AND org_id = ?

    UNION

    SELECT r.parent, r.child, r.type
    FROM cmdb_rel r
    INNER JOIN ci_relations cr
      ON r.parent = cr.parent OR r.child = cr.child OR r.parent = cr.child OR r.child = cr.parent
    WHERE r.active = '1' AND r.org_id = ?
  )
  SELECT DISTINCT parent AS source, child AS destination, type AS edge_label
  FROM ci_relations;
`;

    const [relations] = await db.execute(recursiveQuery, [ciId, ciId, orgId, orgId]);

    if (relations.length === 0) {
      return res.status(200).json({ success: false, message: "No relations found." });
    }

    // Unique node IDs
    const nodeIds = new Set();
    relations.forEach(r => {
      nodeIds.add(r.source);
      nodeIds.add(r.destination);
    });

    const nodeIdList = Array.from(nodeIds);
    const placeholders = nodeIdList.map(() => '?').join(',');
    const [ciNamesResult] = await db.execute(
      `SELECT id, ci_name FROM cmdb WHERE id IN (${placeholders}) AND org_id = ? AND active = '1'`,
      [...nodeIdList, orgId]
    );

    const ciNameMap = new Map();
    ciNamesResult.forEach(row => {
      ciNameMap.set(row.id, row.ci_name);
    });

    // DAGRE layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    nodeIdList.forEach((nodeId) => {
      g.setNode(nodeId.toString(), { width: 150, height: 50 });
    });

    relations.forEach((relation) => {
      g.setEdge(relation.source.toString(), relation.destination.toString());
    });

    dagre.layout(g);


    const edges = relations.map((rel) => ({
      id: `e-${rel.source}-${rel.destination}`,
      source: `${rel.source}`,
      target: `${rel.destination}`,
      label: `${rel?.edge_label && convertName(rel?.edge_label) }`,
      type: "smoothstep",
      animated: true,
    }));

    // Build a graph map for traversal
    const edgeMap = new Map(); // source → [target1, target2, ...]
    edges.forEach(({ source, target }) => {
      if (!edgeMap.has(source)) edgeMap.set(source, []);
      edgeMap.get(source).push(target);
    });

    // Traverse from origin CI to collect all descendants
    const visited = new Set();
    const stack = [ciId];
    while (stack.length) {
      const current = stack.pop();
      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = edgeMap.get(current) || [];
        stack.push(...neighbors);
      }
    }

    // Remove the origin itself if needed
    visited.delete(ciId);
    const descendantIds = visited;

    const nodes = nodeIdList.map((nodeId) => {
      const pos = g.node(nodeId.toString());
      return {
        id: `${nodeId}`,
        sourcePosition: "right",
        targetPosition: "left",
        type: "custom",
        data: {
          label: ciNameMap.get(nodeId) || "Unnamed CI",
          
          isOrigin: nodeId.toString() === ciId,
          isDescendant: descendantIds.has(nodeId.toString()),
        },
        position: { x: pos.x, y: pos.y },
      };
    });


    res.status(200).json({
      success: true,
      data: {
        nodes,
        edges,
      },
    });

  } catch (error) {
    console.error("Error fetching full CI relations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const getOrgRelations = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const query = "SELECT * FROM cmdb_rel WHERE org_id = ? AND active = '1'";
    const values = [orgId];

    const [result] = await db.execute(query, values);
    // console.log('Decoded user ID:', result);

    if (result.length === 0) {
      return res.status(404).json({ message: "No relations found for this organization." });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching organization relations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  getOrgRelations,
  createRelationRecord,
  getRelationRecord,
  getCIRelations
}