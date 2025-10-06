const axios = require('axios');

const postToZapier = async (req, res, next) => {
    try {
        const { webhook_url } = req.body;

        const event = 'New User';
        const email = 'user@example.com';
        const name = 'John Doe'

        const result = await axios.post(webhook_url, {
            body: {
                'event': event,
                'email': email,
                'name': name
            }
        });

        console.log({ success: true, data: result.data,message:'fetched data successfully.' })

        return res.status(200).json({ success: true, data: result.data,message:'fetched data successfully.' });
    } catch (err) {
        console.error(err)
        return res.status(500).json({success:false,message:'failed to fetch data'})
    }
}


module.exports = {
    postToZapier
}