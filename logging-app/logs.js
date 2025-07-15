const BASE_URL = "http://20.244.56.144/evaluation-service/logs";
require('dotenv').config();
const token = process.env.API_TOKEN;

// Reusable Log function to send logs to Test Server
async function Log(stack, level, pkg, message) {
    try {
        const timestamp = new Date().toISOString();
        const payload = {
            stack,
            level,
            package: pkg,
            message,
            timestamp
        };

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Failed to send log to Test Server: ${response.status}`);
            // Fallback to local console logging if API call fails
            console.log(`[${timestamp}] ${stack} ${level} ${pkg}: ${message}`);
        }
    } catch (error) {
        // Log to console if there's a network or other error
        console.error(`Log function error: ${error.message}`);
        console.log(`[${new Date().toISOString()}] ${stack} ${level} ${pkg}: ${message}`);
    }
}

// Example codebase with strategic logging
class DatabaseService {
    async connect() {
        try {
            Log("backend", "info", "db", "Initiating database connection");
            // Simulate database connection
            const connection = await this.establishConnection();
            Log("backend", "info", "db", `Database connection established: ${connection.id}`);
            return connection;
        } catch (error) {
            Log("backend", "fatal", "db", `Critical database connection failure: ${error.message}`);
            throw error;
        }
    }

    async establishConnection() {
        // Simulated connection logic
        return { id: "db_conn_123" };
    }

    async query(queryString, params) {
        try {
            Log("backend", "debug", "db", `Executing query: ${queryString} with params ${JSON.stringify(params)}`);
            // Simulate query execution
            const result = await this.executeQuery(queryString, params);
            Log("backend", "info", "db", `Query executed successfully, returned ${result.length} rows`);
            return result;
        } catch (error) {
            Log("backend", "error", "db", `Query execution failed: ${error.message}, query: ${queryString}`);
            throw error;
        }
    }

    async executeQuery(queryString, params) {
        // Simulated query execution
        return [{ id: 1, name: "test" }];
    }
}

class RequestHandler {
    async processRequest(request) {
        try {
            Log("backend", "info", "handler", `Processing request: ${request.method} ${request.url}`);
            
            // Validate request data type
            if (typeof request.body.active !== 'boolean') {
                Log("backend", "error", "handler", `Received ${typeof request.body.active}, expected boolean for active field`);
                throw new Error("Invalid data type for active field");
            }

            const dbService = new DatabaseService();
            const result = await dbService.query("SELECT * FROM users WHERE active = ?", [request.body.active]);
            
            Log("backend", "info", "handler", `Request processed successfully, response contains ${result.length} records`);
            return result;
        } catch (error) {
            Log("backend", "error", "handler", `Request processing failed: ${error.message}, request: ${request.method} ${request.url}`);
            throw error;
        }
    }
}

// Example usage
async function main() {
    const handler = new RequestHandler();
    
    // Example of successful request
    try {
        const result = await handler.processRequest({
            method: "GET",
            url: "/users",
            body: { active: true }
        });
        console.log("Result:", result);
    } catch (error) {
        console.error("Main error:", error);
    }

    // Example of failed request due to type mismatch
    try {
        await handler.processRequest({
            method: "GET",
            url: "/users",
            body: { active: "true" } // Wrong type
        });
    } catch (error) {
        console.error("Main error:", error);
    }
}

// Run the example
main();