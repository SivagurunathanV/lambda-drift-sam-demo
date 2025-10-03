const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.getAllItemsHandler = async (event) => {
    const { limit = 20, nextToken } = event.queryStringParameters || {};
    
    try {
        const params = {
            TableName: process.env.SAMPLE_TABLE,
            Limit: Math.min(parseInt(limit), 100), // Cap at 100 items max
            ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined
        };

        const data = await docClient.scan(params).promise();
        
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                items: data.Items,
                nextToken: data.LastEvaluatedKey ? 
                    Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64') : 
                    undefined
            })
        };
        
        return response;
    } catch (err) {
        console.error('Error retrieving items:', err);
        return {
            statusCode: err.statusCode || 500,
            body: JSON.stringify({
                message: err.message || 'Internal Server Error',
                errorType: err.name || 'UnknownError'
            })
        };
    }
};