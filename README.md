# Project Management Microservice Documentation

## Table of Contents
1. Introduction
2. Service Overview
   - 2.1. Purpose
   - 2.2. Functionality
3. API Endpoints
   - 3.1. Create Project
   - 3.2. Update Project
   - 3.3. Comment On Project
4. Data Schema
   - 4.1. Project Data Structure
5. Security Measures
   - 5.1. Authentication
   - 5.2. Authorization
6. Error Handling
7. Performance and Scalability
8. Deployment
9. Testing
10. Maintenance and Support
11. Conclusion
12. Appendices
   - A. API Examples
   - B. Error Codes
   - C. References

## 1. Introduction
- This document provides detailed documentation for the Project Management Microservice, a crucial component of our Web Code Editor platform. It describes the microservice's purpose, functionality, API endpoints, data schema, security measures, and more.

## 2. Service Overview
### 2.1. Purpose
- The Project Management Microservice is responsible for creating, updating, and deleting projects, rating projects, and project collaboration.

### 2.2. Functionality
- It enables users to manage projects, including project creation, project editing, and project removal.

## 3. API Endpoints
- The Project Management Microservice offers the following API endpoints:

- All Routes are AUthenticated Except Explicitly Excluded in this documentation

### 3.1. Create Project
- **Endpoint:** POST `/api/v1/project/new`
- **Description:** Allows Users to Create Projects.
- **Request Body:**
    ```json
   {
    "projectTitle":"Landing Page",
    "folderId":"Mongo_db_id",//optional (id of folder if project is being added to a folder)
    "projectDescription":"Landing Page Design Test",
    "type":"public",//public or private
    "html":"<h1>Hello World</h1>",
    "css":"h1{color:blue;}",//optional
    "javascript":"alert('Hello World')",//optional
    "projectSnapShot":"snapshot_image_url"// to achieve this the frontend should use the "html2canvas JavaScript library" library to take a snap shot of the iframe when the user hit SAVE.
   }

    ```
- **Response (Success):**
    ```json
    {
    "status": true,
    "message": "Project Created Successfully",
    "publicId": "unique_public_id" //this is so the public id can be appended into the url for user to update project without reloading page
    }
    ```
- **Response (Error):**
    ```json
    {
    "status": false,
    "message": "Invalid Project Type",
    "error_code": 400,
    "error_details": "Project type from the client should be either 'public' or 'private' "
    }
    ```
### 3.2. Update Project
- **Endpoint:** POST `/api/v1/project/edit`
- **Description:** Allows Users to Update Projects.
- **Request Body:**
    ```json
   {
    "publicId":"Project_Public_Id",
    "html":"<h1>Hello World</h1>",
    "css":"h1{color:blue;}",//optional
    "javascript":"alert('Hello World')",//optional
    "projectSnapShot":"snapshot_image_url"// to achieve this the frontend should use the "html2canvas JavaScript library" library to take a snap shot of the iframe when the user hit SAVE.
   }

    ```
- **Response (Success):**
    ```json
    {
    "status": true,
    "message": "Project Updated Successfully"
    }
    ```
- **Response (Error):**
    ```json
    {
    "status": false,
    "message": "Project Not Found",
    "error_code": 400,
    "error_details": "Project Was not Found, either the public id is incorrect or the logged in user does not own the project"
    }
    ```
### 3.3. Comment On Project
- **Endpoint:** POST `/api/v1/project/comment/new`
- **Description:** Allows Users to Comment on Projects.
- **Request Body:**
    ```json
   {
    "projectPublicId":"Project_Public_Id",
    "comment":"This is an Amazing Project, Keep it up!!!",
   }

    ```
- **Response (Success):**
    ```json
    {
    "status": true,
    "message": "Comment Added"
    }
    ```
- **Response (Error):**
    ```json
    {
    "status": false,
    "message": "Comment Message Required",
    "error_code": 400,
    "error_details": "the client did not send comment in the request body"
    }
    ```

### 3.4. Create Folder
- **Endpoint:** POST `/api/v1/project/folder/new`
- **Description:** Allows Other Users to Create a Folder to Oranize their Projects.
- **Request Parameters:**
    ```json
   {
    "username":"user_name", // username of the owner of the folder
    "folder":"folderUniqueName", // folder unique name of the requested folder
   }

    ```
- **Response (Success):**
    ```json
    {
    "status": true,
    "folder": {
        "_id": "654d13e75cab1400793c728e",
        "folderName": "Training Projects",
        "public_id": "d_zsimi-k",
        "folderUniqueName": "trainingkd",
        "projects": [
            {
                "_id": "654d1557739a988be059e387",
                "public_id": "houlgwpoi",
                "projectTitle": "Landing Page",
                "projectDescription": "Landing Page Design Test2",
                "likesCount": 0,
                "commentCount": 0
            }
        ],
        "createdAt": "2023-11-09T17:16:23.693Z"
    }

    }
    ```
- **Response (Error):**
    ```json
    {
    "status": false,
    "message": "User Not Found",
    "error_code": 400,
    "error_details": "The User attached to the folder does not exis, the username appears to be invalid"
    }
    ```
    ```json
    {
    "status": false,
    "message": "Folder Not Found",
    "error_code": 404,
    "error_details": "he Request folder does not exist"
    }
    ```
### 3.5. Get User Folder
- **Endpoint:** GET `/api/v1/project/:username/:folder`
- **Description:** Allows Other Users to Access all public projects in a particular public folder, for a particular user. `|| Not Authenticated`
- **Request Parameters:**
    ```json
   {
    "username":"user_name", // username of the owner of the folder
    "folder":"folderUniqueName", // folder unique name of the requested folder
   }

    ```
- **Response (Success):**
    ```json
    {
    "status": true,
    "folder": {
        "_id": "654d13e75cab1400793c728e",
        "folderName": "Training Projects",
        "public_id": "d_zsimi-k",
        "folderUniqueName": "trainingkd",
        "projects": [
            {
                "_id": "654d1557739a988be059e387",
                "public_id": "houlgwpoi",
                "projectTitle": "Landing Page",
                "projectDescription": "Landing Page Design Test2",
                "likesCount": 0,
                "commentCount": 0
            }
        ],
        "createdAt": "2023-11-09T17:16:23.693Z"
    }

    }
    ```
- **Response (Error):**
    ```json
    {
    "status": false,
    "message": "User Not Found",
    "error_code": 400,
    "error_details": "The User attached to the folder does not exis, the username appears to be invalid"
    }
    ```
    ```json
    {
    "status": false,
    "message": "Folder Not Found",
    "error_code": 404,
    "error_details": "he Request folder does not exist"
    }
    ```

## 4. Data Schema
### 4.1. Project Data Structure
- The microservice uses a database schema to store Project data, including Project ID, title, description, media links, and other relevant information.

## 5. Security Measures
### 5.1. Authentication
- Project Management is secured with proper authentication mechanisms to ensure only authorized administrators can create, update, or delete Project.

### 5.2. Authorization
- Authorization mechanisms control access to specific Project Management functions based on administrative roles and permissions.

## 6. Error Handling
- The microservice provides clear and structured error responses, including error codes and descriptions for easy debugging.

## 7. Performance and Scalability
- The microservice is designed for performance and can be scaled horizontally to handle increased Project Management tasks.

## 8. Deployment
- Details the deployment environment, including dependencies and configuration settings.

## 9. Testing
- Describes the testing approach, including unit tests, integration tests, and user testing.

## 10. Maintenance and Support
- Discusses ongoing maintenance, monitoring, and administrator support.

## 11. Conclusion
- This documentation provides an in-depth understanding of the Project Management Microservice. It serves as a reference for administrators and developers to ensure effective Project Management within the platform.

## 12. Appendices
- Include additional information such as API request/response examples, error codes, and references.

This document serves as a comprehensive guide for the Project Management Microservice. It can be expanded and customized based on your project's specific requirements and needs.
