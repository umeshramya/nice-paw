# MCP Server Specification: Hospital Reports Access System

## 1. Overview
A Model Context Protocol (MCP) server that enables hospitals to access their reports and financial data locally on their PCs. The system provides secure authentication, data synchronization from cloud to local database, and query tools for hospital analytics.

## 2. MCP Client Compatibility

### 2.1 Supported MCP Clients
- **Claude Desktop**: Primary target client with native MCP support
- **Any MCP-compliant client**: Compatible with any client implementing MCP protocol
- **Future Custom Clients**: Designed to support custom MCP clients (e.g., nice-pow)

### 2.2 Client Integration Requirements
1. **MCP Protocol Version**: Supports MCP protocol version 1.x
2. **Transport**: STDIO transport (standard input/output)
3. **Tool Discovery**: Dynamic tool registration and discovery
4. **Resource Support**: Optional resource endpoints for data access

### 2.3 Future Client Development (nice-pow)
- **Custom MCP Client**: Potential development of hospital-specific MCP client
- **Enhanced UI**: Specialized interface for hospital administrators
- **Advanced Features**: Real-time notifications, dashboard widgets
- **Integration**: May include additional hospital management tools

### 2.4 Server-Client Communication
```
MCP Client (Claude Desktop/nice-pow) ↔ MCP Server ↔ Local Database/Cloud APIs
```
- Server exposes tools for querying hospital data
- Client invokes tools and displays results
- All authentication and data sync handled by server

## 3. Objectives
- Allow hospitals to access reports offline/on-premises
- Secure authentication with encrypted credentials
- Synchronize voucher and financial data from cloud to local database
- Provide analytical query tools for hospital operations
- Support multiple hospitals per user (if authorized)

## 4. System Architecture

### 4.1 Components
1. **MCP Server**: Core server implementing MCP protocol
2. **Authentication Module**: Handles hospital login/auth
3. **Data Sync Module**: Synchronizes data from cloud APIs to local DB
4. **Local Database**: PostgreSQL/SQLite for local data storage
5. **Query Tools**: Analytical tools for hospital metrics
6. **Configuration Manager**: Manages hospital profiles and encryption

### 4.2 Data Flow
```
Cloud APIs → MCP Server → Local Database → Query Tools
          (Auth)        (Sync)           (Analysis)
```

## 5. Authentication System

### 5.1 Authentication Flow
1. Hospital user provides email/password via MCP tools
2. Credentials encrypted with PC owner's chosen key
3. Auth token obtained from cloud API
4. Token stored encrypted locally for subsequent API calls

### 5.2 Credential Storage
- **Storage Location**: `~/.mcp-hospital-reports/hospitals/[hospital-id]/`
- **Encryption**: AES-256-GCM with key provided by PC owner
- **File Structure**:
  ```
  hospitals/
    hospital-001/
      config.json (encrypted)
      auth-token.json (encrypted)
      database.db (SQLite) or postgres connection config
    hospital-002/
      ...
  ```

## 6. API Integration

### 6.1 Required Cloud APIs
**Core APIs (Minimum Required):**
1. **Authentication API**: `POST /api/auth/hospital-login`
   - Input: email, password
   - Output: auth token, hospital ID, permissions
   - *Purpose: Secure hospital login and token acquisition*

2. **Vouchers Data API**: `GET /api/hospital/[id]/vouchers`
   - Input: date range, filters
   - Output: voucher data including transactions
   - *Purpose: Retrieve financial and patient transaction data*

**Optional/Extended APIs:**
3. **Reports Data API**: `GET /api/hospital/[id]/reports`
   - Input: report type, date range
   - Output: structured report data
   - *Purpose: Additional report formats and analytics*

### 6.2 Data Synchronization
- **Initial Sync**: Full data download on first setup
- **Incremental Sync**: Delta updates based on last sync timestamp
- **Schedule**: Configurable (daily, hourly, manual)
- **Conflict Resolution**: Cloud data takes precedence

## 7. Local Database Schema

### 7.1 Core Tables
```sql
-- Hospitals
CREATE TABLE hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    last_sync TIMESTAMP,
    config JSONB
);

-- Vouchers
CREATE TABLE vouchers (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES hospitals(id),
    voucher_date DATE NOT NULL,
    voucher_type TEXT NOT NULL,
    amount DECIMAL(15,2),
    patient_id TEXT,
    encounter_id TEXT,
    consultant_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cloud_updated_at TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES hospitals(id),
    patient_type TEXT, -- OPD, IPD
    admission_date DATE,
    discharge_date DATE,
    consultant_id TEXT
);

-- Consultants
CREATE TABLE consultants (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES hospitals(id),
    name TEXT NOT NULL,
    specialty TEXT,
    commission_rate DECIMAL(5,2)
);

-- Transactions
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES hospitals(id),
    voucher_id TEXT REFERENCES vouchers(id),
    transaction_date DATE,
    amount DECIMAL(15,2),
    type TEXT, -- CREDIT, DEBIT
    category TEXT,
    description TEXT
);
```

## 8. Query Tools (MCP Tools)

### 8.1 Analytical Queries
1. **opd_patients_today**
   - Parameters: hospital_id, date
   - Returns: Count of OPD patients for the day

2. **daily_collection**
   - Parameters: hospital_id, date
   - Returns: Total collections (cash, card, online)

3. **ipd_statistics**
   - Parameters: hospital_id, date_range
   - Returns: Admissions, discharges, current IPD count

4. **consultant_earnings**
   - Parameters: hospital_id, consultant_id, date_range
   - Returns: Earnings breakdown per consultant

5. **consultant_payments**
   - Parameters: hospital_id, consultant_id, date_range
   - Returns: Payments made to consultant

6. **voucher_summary**
   - Parameters: hospital_id, date_range, voucher_type
   - Returns: Summary of vouchers by type

### 8.2 Tool Implementation
Each tool will be implemented as an MCP tool with:
- Input validation
- SQL query execution
- Result formatting
- Error handling

## 9. Configuration Management

### 9.1 PC Owner Configuration
- **Encryption Key**: User-provided key for credential encryption
- **Database Type**: Choice between PostgreSQL or SQLite
- **Sync Schedule**: Default and custom sync intervals
- **Storage Location**: Default or custom folder path

### 9.2 Hospital Profiles
- Multiple hospital profiles per installation
- Independent sync schedules per hospital
- Role-based access control (if user has access to multiple hospitals)

## 10. Security Considerations

### 10.1 Data Protection
- Credentials encrypted at rest
- Auth tokens encrypted and refreshed periodically
- Local database encrypted (SQLite encryption or PostgreSQL TDE)
- No plaintext storage of sensitive data

### 10.2 Access Control
- Hospital data isolation (separate folders/databases)
- PC owner controls encryption key
- API tokens scoped to specific hospital
- Audit logging of data access

### 10.3 Network Security
- HTTPS for all API communications
- Certificate pinning for API endpoints
- Firewall-friendly (outbound HTTPS only)

## 11. Deployment and Installation

### 11.1 Requirements
- Node.js 18+ or Python 3.9+
- PostgreSQL (optional) or SQLite
- 500MB+ storage (depending on data volume)
- Internet connection for sync

### 11.2 Installation Steps
1. Install MCP server package
2. Run configuration wizard
3. Set encryption key
4. Add hospital credentials
5. Initial data sync
6. Verify query tools

### 11.3 Update Mechanism
- Automatic update checks
- Backward compatibility for data format
- Migration scripts for schema changes

## 12. Error Handling and Monitoring

### 12.1 Error Categories
- Authentication failures
- Network connectivity issues
- Database errors
- API rate limiting
- Data validation errors

### 12.2 Recovery Strategies
- Retry logic for transient failures
- Offline mode with cached data
- Data integrity checks
- Manual sync trigger

### 12.3 Logging
- Operation logs (sync attempts, queries)
- Error logs with stack traces
- Performance metrics
- Audit trails for data access

## 13. Testing Strategy

### 13.1 Test Types
1. **Unit Tests**: Individual components
2. **Integration Tests**: API interactions
3. **Security Tests**: Encryption and auth
4. **Performance Tests**: Large dataset handling
5. **Compatibility Tests**: Different OS/database combinations

### 13.2 Test Data
- Mock hospital data
- Various voucher types
- Edge cases (empty results, large datasets)
- Invalid input scenarios

## 14. Future Enhancements

### 14.1 Planned Features
- Real-time data sync (WebSocket)
- Advanced analytics dashboard
- Custom report builder
- Multi-user access within hospital
- Mobile app companion

### 14.2 Integration Possibilities
- EHR system integration
- Accounting software export
- Regulatory compliance reports
- Predictive analytics

## 15. Glossary

- **MCP**: Model Context Protocol
- **OPD**: Outpatient Department
- **IPD**: Inpatient Department
- **Voucher**: Financial transaction record
- **Sync**: Data synchronization between cloud and local

## 16. Appendix

### 16.1 API Examples
```json
// Authentication request
{
  "email": "hospital@example.com",
  "password": "secure_password"
}

// Vouchers API response
{
  "vouchers": [
    {
      "id": "voucher-001",
      "date": "2024-01-15",
      "type": "OPD",
      "amount": 1500.00,
      "patient_id": "patient-123"
    }
  ]
}
```

### 16.2 Sample Queries
```sql
-- OPD patients today
SELECT COUNT(*) FROM patients
WHERE hospital_id = ?
  AND patient_type = 'OPD'
  AND DATE(created_at) = CURRENT_DATE;

-- Daily collection
SELECT SUM(amount) FROM transactions
WHERE hospital_id = ?
  AND transaction_date = ?
  AND type = 'CREDIT';
```

---

*Document Version: 1.0*
*Created: 2024-04-06*
*Status: Draft Specification*