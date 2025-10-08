const { db } = require('../../config/DB-connection')

// app.post('/get/report-data/', 
const getReportdata = async (req, res) => {
  const { aggregation, groupBy, selectedTable, stackBy, filterConditions } = req.body
  // console.log('line: 644', { aggregation, groupBy, selectedTable, stackBy, filterConditions })

  async function generateSQLQuery({ aggregation, groupBy, selectedTable, stackBy, filterConditions }) {
    if (!selectedTable) {
      throw new Error('Selected table is required.');
    }

    let query = `SELECT * FROM wonhubs.${selectedTable}`;

    // Check if aggregation is valid and column is provided
    if ((aggregation && groupBy) || stackBy !== null) {
      let stackValues = [];

      if (stackBy) {
        const [stackByResult] = await db.execute(`SELECT ${stackBy} FROM wonhubs.${selectedTable} GROUP BY ${stackBy}`)
        // if (error) {
        //   console.error(error);
        //   return res.status('status').send(body)
        // }

        stackValues = stackByResult.map(record => record[stackBy])
        const formatQuery = () => stackValues.array.forEach(element => {
          return ` ${aggregation.toUpperCase()}()`
        });

        const includeStackByValuesInQuery = `
            SELECT 
              ${stackValues}
            FROM wonhubs.${selectedTable}
          `
        // console.log(stackValues)

        query = `SELECT ${groupBy}, ${stackBy}, ${aggregation.toUpperCase()}(${groupBy}) AS ${groupBy}_count FROM wonhubs.${selectedTable}`;
      } else {
        query = `SELECT ${groupBy}, ${aggregation.toUpperCase()}(${groupBy}) AS ${groupBy}_count FROM wonhubs.${selectedTable}`;
      }
    }

    // Apply filters if they exist and are valid
    if (filterConditions && filterConditions.length > 0) {
      let filterQuery = filterConditions
        .filter(({ column, operation, value }) => column && operation && value)  // Filter out incomplete conditions
        .map(({ column, operation, value, condition }, index, array) => {
          const logic = index < array.length - 1 && condition ? condition.toUpperCase() : '';
          return `${column.value.name} ${operation.value.value} '${value}' ${logic}`;  // Build the filter string
        })
        .join(' ');

      if (filterQuery.trim()) {
        query += ` WHERE ${filterQuery}`;
      }
    }

    // Handle groupBy and stackBy
    if (groupBy) {
      query += ` GROUP BY ${groupBy}`;
    }

    if (stackBy) {
      query += `, ${stackBy}`;
    }

    query += ';';
    return query;
  }

  function generateOrderByQuery({ aggregation, groupBy, selectedTable, stackBy, filterConditions }) {
    if (!selectedTable) {
      throw new Error('Selected table is required.');
    }

    let query = `SELECT * FROM wonhubs.${selectedTable}`;

    // Apply filters if they exist and are valid
    if (filterConditions && filterConditions.length > 0) {
      let filterQuery = filterConditions
        .filter(({ column, operation, value }) => column && operation && value)  // Filter out incomplete conditions
        .map(({ column, operation, value, condition }, index, array) => {
          const logic = index < array.length - 1 && condition ? condition.toUpperCase() : '';
          return `${column.value.name} ${operation.value.value} '${value}' ${logic}`;  // Build the filter string
        })
        .join(' ');

      if (filterQuery.trim()) {
        query += ` WHERE ${filterQuery}`;
      }
    }

    // Handle groupBy and stackBy
    if (groupBy) {
      query += ` ORDER BY ${groupBy}`;
    }

    if (stackBy) {
      query += `, ${stackBy}`;
    }


    query += ` LIMIT 100 OFFSET 0;`;
    return query;
  }

  const groupByQuery = await generateSQLQuery({ aggregation, groupBy, selectedTable, stackBy, filterConditions }) + ``;
  const orderByQuery = generateOrderByQuery({ aggregation, groupBy, selectedTable, stackBy, filterConditions })
  // console.log('groupByQuery', groupByQuery)

  let orderByResult;

  const [orderByResults] = await db.execute(orderByQuery)
  // if (orderByResults.length <1) {
  //   // console.error(error);
  //   return res.status('status').send(body)
  // }
  orderByResult = orderByResults
  // console.log('groupBy:', result)
  // console.log("orderByResult", orderByResult)

  const [groupByRersult] = await db.execute(groupByQuery)
  // if (error) {
  //   // console.error(error);
  //   return res.status('status').send(body)
  // }
  // console.log('groupBy:', result);

  res.status(200).json({
    success: true,
    generatedReportData: groupByRersult,
    orderByResult: orderByResult
  })
}

// app.post('/fetch/gauge-reports-data',
const fetchGaugeReportsData = async (req, res) => {
  const { dataColumns, tableName } = req.body
  // console.log(dataColumns.length)
  if (dataColumns?.length < 1 || !tableName) {
    return res.status(500).json({ success: false, message: 'Missing required parameter: dataColumns, tableName' })
  }

  let query = `SELECT`
  const formatQuery = () => dataColumns.map((column, index) => index === 0 ?
    query += ` COUNT(${column.value.name}) AS ${column.value.name}_count` :
    query += ` ,COUNT(${column.value.name}) AS ${column.value.name}_count`)
  formatQuery()
  query += ` FROM wonhubs.${tableName}`

  const [results] = await db.execute(query)

  if (results.length > 0) {
    // console.log(error);
    return res.status(200).json({ success: true, data: results })
  }
  return res.status(500).json({ success: false, message: 'Error fetching data' });
}


module.exports = {
  getReportdata,
  fetchGaugeReportsData
}