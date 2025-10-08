const { db } = require("../../config/DB-connection");
const decodeAccessToken = require('../../utils/auth/DecodeAccessToken')
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");

async function getColumnNamesWithTypes(tableName, callback) {
  const query = `
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = ?
  `;

  const [results] = await db.execute(query, ['wonhubs', tableName])

  // Map each result row to an object containing column name and type
  const columnsInfo = results.map((row) => {
    return ({
      name: row.COLUMN_NAME,
      type: row.DATA_TYPE
    })
  });
  callback(null, columnsInfo);
}

const getTableData = async (req, res) => {
  try {
    const tableName = req.params.tableName;
    if (!tableName) {
      return res.status(400).json({ success: false, error: 'Table name is required' });
    }
    const { id } = decodeAccessToken(req.headers.authorization);
    const organizationId = await getOrganizationIdWithUserId(id);
    const query = tableName === 'users' ?
      `SELECT * FROM ${tableName} WHERE organization_id = ?` :
      (tableName === 'table_selected_columns' || tableName === 'apps' || tableName === 'reports') ?
        `SELECT * FROM ${tableName}` :
        `SELECT * FROM ${tableName} WHERE org_id = ?`
    // console.log('Query:', query, 'Params:', [userId, organizationId]);
    const [results] = await db.execute(query, [organizationId]);

    // if (results.length === 0) {
    //   return res.status(404).json({ error: 'Table not found' })
    // }

    const tableData = results
    res.status(200).json({ success: true, [tableName]: tableData })
  } catch (error) {
    console.error(`Error fetching table Details : from any table data`, 'error: ', error)
    return res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
}

// API Routes to get any table names
// app.get('', authenticateToken,
const getTableColumns = async (req, res) => {
  try {
    const tableName = req.params.tableName;
    if (!tableName) {
      return res.status(400).json({ error: 'Table name is required' });
    }
    const { id } = decodeAccessToken(req.headers.authorization);
    const organizationId = await getOrganizationIdWithUserId(id);

    await getColumnNamesWithTypes(tableName, (error, columnNames) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ columns: columnNames });
      }
    });
  } catch (error) {
    console.error(`Error fetching columns for table:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getInstanceId = async (req, res) => {
  try {
    const { id } = decodeAccessToken(req.headers.authorization);
    const query = `SELECT instance_id FROM users where id = ?`;
    const [results] = await db.execute(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'No instance found' });
    }
    console.log('instace id: ', results)
    res.json({ instanceId: results[0].instance_id });
  } catch (error) {
    console.error(`Error fetching instance ID from table: `, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getAllApps = async (req, res) => {
  try {
    const query = `SELECT * FROM apps`
    const [apps] = await db.execute(query)
    res.status(200).json({ success: true, data: apps })
  } catch (err) {
    console.log('error getting all apps data: ', err)
    res.status(500).jhson({ success: false, message: err })
  }
}

// API to get record data from any table
// app.post('', 
const getAnyRecorddata = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { tableName, recordId } = req.params
  const { eventData } = req.body
  // console.log(eventData)

  try {
    const query = `SELECT * FROM wonhubs.${tableName} WHERE id=${recordId}`

    const [results] = await db.query(query)
    if (results.length > 0) {
      // console.error(`error getting the record details:`)
      return res.status(200).json({ success: true, data: results })
    }
    return res.status(500).json({ success: false, message: 'Internal Server Error' })

    if (eventData) {
      // createEvent({ ...eventData, title: 'Record data fetched' })
    }

  } catch (err) {
    console.error(`error getting the record details: ${err}`)
  }
}

module.exports = {
  getTableData,
  getTableColumns,
  getInstanceId,
  getAllApps,
  getAnyRecorddata
}