# ProGenius Backend

## Setup & Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configuration**:
    - A `.env` file has been created for you with default local settings.
    - Ensure you have MongoDB installed and running locally on port 27017.
    - If your MongoDB URI is different, update `MONGODB_URI` in `.env`.

3.  **Run the Server**:
    - Development (with auto-reload):
      ```bash
      npm run dev
      ```
    - Production:
      ```bash
      npm start
      ```

## API Endpoints

The API is served at `http://localhost:8000/v1`.

- **Admin**: `/v1/admin`
- **Customer**: `/v1/customer`
- **Auth**: `/v1/auth`
- **Courses**: `/v1/course`

## Frontend Connection

The Flutter apps have been configured to connect to `http://10.0.2.2:8000/v1`.
- **10.0.2.2** is the special IP address for Android Emulators to access the host machine's `localhost`.
- If running on **iOS Simulator** or **Web**, change the base URL in the Flutter apps to `http://localhost:8000/v1`.
