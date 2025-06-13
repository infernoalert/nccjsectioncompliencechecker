# Swagger Authentication Steps

## 1. Login to Get JWT Token

1. In Swagger UI, find the **Auth** section
2. Use **POST /api/auth/login**
3. Click "Try it out"
4. Use this request body:

```json
{
  "email": "payamamerian1@gmail.com",
  "password": "your_password_here"
}
```

5. Click "Execute"
6. Copy the `token` from the response

## 2. Authorize in Swagger

1. Click the **Authorize** button (🔒) at the top right of Swagger UI
2. In the "bearerAuth" field, enter: `Bearer YOUR_JWT_TOKEN`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **Authorize**
4. Click **Close**

## 3. Test Energy Diagram Endpoint

Now you can test the energy diagram endpoints:

1. Find **Energy Diagram Generator** section
2. Use **POST /api/projects/{projectId}/energy-diagram/generate**
3. Enter your project ID: `684a53d0312f7c81654304c4`
4. Use request body:
```json
{
  "saveToFile": false
}
```
5. Click "Execute"

## Expected Success Response:
```json
{
  "success": true,
  "commands": [
    "add,cloud,4,0",
    "add,onpremise,4,8",
    // ... more commands
  ],
  "metadata": {
    "generatedAt": "2025-06-13T02:14:22.000Z",
    "nodeCount": 5,
    "projectId": "684a53d0312f7c81654304c4"
  }
}
``` 