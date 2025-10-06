
const axios = require('axios');
const soap = require('soap');
const { db } = require("../../config/DB-connection");
require('dotenv').config();
// const router = express.Router();

function detectSOAP(url, headers, body) {
    if (!url) return false;
    if (url.toLowerCase().includes('?wsdl')) return true;
    if (headers['SOAPAction'] || headers['soapaction']) return true;
    if (typeof body === 'string' && body.includes('<soap:Envelope')) return true;
    return false;
}

// +++++++++++++++++++++++++++++++++++++++++++++ testing Soap Connection ++++++++++++++++++++++++++++++++++++++++++++++
const testSoapConnection = async (req, res) => {
    const { token, headers = {}, body } = req.body;
    const url = `https://soap-service-free.mock.beeceptor.com/CountryInfoService?WSDL`;
    // console.log('getting soap req: ');

    try {
        const isSOAP = detectSOAP(url, headers, body);
        let result;

        if (isSOAP) {
            console.log('Detected SOAP request');
            const client = await soap.createClientAsync(url);

            const description = client.describe();
            const serviceName = Object.keys(description)[0];
            const portName = Object.keys(description[serviceName])[0];
            const methodName = Object.keys(description[serviceName][portName])[0];

            console.log(`SOAP: Service=${serviceName}, Port=${portName}, Method=${methodName}`);

            if (typeof client[methodName + 'Async'] !== 'function') {
                throw new Error(`SOAP method ${methodName}Async not found`);
            }

            const [response] = await client[methodName + 'Async'](body || {});
            result = response;
        } else {
            console.log('Detected REST request');
            const response = await axios.post(url, body || {}, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                    ...headers,
                },
            });
            result = response.data;
        }

        console.log('soap api result: ', result);
        res.json({ success: true, result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Call failed', error: err.message });
    }
};

const testPostSoapApi = async (req, res) => {
    const { token, headers = {}, body } = req.body;
    const url = "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL";
    // const url = `https://soap-service-free.mock.beeceptor.com/CountryInfoService.wso`; // SOAP endpoint

    try {
        const isSOAP = detectSOAP(url, headers, body);
        let result;

        if (isSOAP) {
            console.log('Detected SOAP request');

            // 1. Create a SOAP client using the WSDL
            const client = await soap.createClientAsync(url);

            // 2. Describe the service to find available methods
            const description = client.describe();
            const serviceName = Object.keys(description)[0]; // e.g., CountryInfoService
            const portName = Object.keys(description[serviceName])[0]; // e.g., CountryInfoPort
            const methodName = Object.keys(description[serviceName][portName])[0]; // e.g., ListOfContinentsByName

            console.log(`SOAP: Service=${serviceName}, Port=${portName}, Method=${methodName}`);

            // 3. Check if method exists on the client
            const soapFn = client[methodName + 'Async'];
            if (typeof soapFn !== 'function') {
                throw new Error(`SOAP method ${methodName}Async not found on client`);
            }

            // 4. Call the method with the provided body
            const [response] = await soapFn.call(client, body || {});
            result = response;

            // 5. Send back the result
            res.json({ success: true, method: methodName, result });
        } else {
            res.status(400).json({ success: false, message: 'Not a SOAP request' });
        }
    } catch (err) {
        console.error('SOAP call error:', err);
        res.status(500).json({
            success: false,
            message: 'Call failed',
            error: err.message,
        });
    }
};

const testAnySoapApi = async (req, res) => {
    const { wsdlUrl, methodName, headers = {}, body = {} } = req.body;

    if (!wsdlUrl || !methodName) {
        return res.status(400).json({
            success: false,
            message: 'Missing wsdlUrl or methodName in request body',
        });
    }

    try {
        // 1. Create SOAP client
        const client = await soap.createClientAsync(wsdlUrl);

        // 2. Optional: set custom headers (like SOAPAction or Auth)
        if (Object.keys(headers).length > 0) {
            client.addHttpHeader('SOAPAction', headers.SOAPAction || '');
            for (const [key, value] of Object.entries(headers)) {
                client.addHttpHeader(key, value);
            }
        }

        // 3. Validate method exists
        if (typeof client[`${methodName}Async`] !== 'function') {
            const available = Object.keys(client);
            return res.status(400).json({
                success: false,
                message: `Method '${methodName}' not found on client. Available methods: ${available.join(', ')}`,
            });
        }

        // 4. Call the SOAP method with the provided body
        const [result] = await client[`${methodName}Async`](body);

        // 5. Respond with the result
        return res.json({
            success: true,
            method: methodName,
            result,
        });
    } catch (err) {
        console.error('SOAP call failed:', err);
        return res.status(500).json({
            success: false,
            message: 'SOAP request failed',
            error: err.message,
        });
    }
};

const handleSoapOperation = async (req, res) => {
    const {
        wsdlUrl,
        methodName,
        body = {},
        headers = {
            "Content-Type": "text/xml;charset=UTF-8",
            SOAPAction: `${methodName}`,
        },
    } = req.body;

    // console.log('soap payload: ', wsdlUrl, methodName, body, headers);

    if (!wsdlUrl || !methodName) {
        return res.status(400).json({
            success: false,
            message: 'Missing wsdlUrl or methodName in request',
        });
    }

    try {
        // Fetch the WSDL to validate its structure
        const { data: wsdlContent } = await axios.get(wsdlUrl);

        // Updated WSDL validation: accept <definitions> or <wsdl:definitions> (case-insensitive)
        const isValidWSDL = /<(\w+:)?definitions[\s>]/i.test(wsdlContent);
        if (!isValidWSDL) {
            return res.status(400).json({
                success: false,
                message: 'Provided URL did not return a valid WSDL document',
            });
        }

        // Create SOAP client
        const client = await soap.createClientAsync(wsdlUrl);

        // Add headers if any
        if (headers && Object.keys(headers).length > 0) {
            for (const { key, value } of headers) {
                if (key && value) client.addHttpHeader(key, value);
            }
        }

        // Validate method
        const asyncMethod = client[`${methodName}Async`];
        if (typeof asyncMethod !== 'function') {
            return res.status(400).json({
                success: false,
                message: `SOAP method "${methodName}" not found`,
            });
        }

        // Call the SOAP method
        const [result] = await asyncMethod(body);

        // Return the response
        res.json({
            success: true,
            operation: methodName,
            result,
        });
    } catch (err) {
        console.error('SOAP Error:', err);
        res.status(500).json({
            success: false,
            message: 'SOAP request failed',
            error: err.message,
        });
    }
};





module.exports = {
    testSoapConnection,
    testPostSoapApi,
    testAnySoapApi,
    handleSoapOperation
}