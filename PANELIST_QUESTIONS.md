# Panelist Questions: Integration of Payroll into HRIS
## Research Title: Integration of Payroll into Human Resources Information System using rule-based calculation and formula parsing algorithms at Eulogio Amang Rodriguez

---

## 🔒 SECURITY-RELATED QUESTIONS

### Authentication & Authorization

1. **JWT Secret Management**: I noticed that your JWT secret has a hardcoded fallback value (`process.env.JWT_SECRET || 'secret'`). What measures have you implemented to ensure the JWT_SECRET environment variable is properly configured in production? How do you prevent the use of the default 'secret' value in production environments?

2. **Token Expiration**: Your JWT tokens expire in 10 hours. What is the rationale behind this duration? Have you implemented token refresh mechanisms, and how do you handle token expiration on the client side?

3. **Role-Based Access Control (RBAC)**: I see you have roles like 'superadmin', 'administrator', and 'staff'. Can you explain your RBAC implementation? How do you ensure that users cannot escalate their privileges, and what mechanisms prevent unauthorized access to sensitive payroll operations?

4. **2FA Implementation**: Your 2FA codes are stored in memory (`twoFACodes` object). What happens if the server restarts? How do you handle 2FA code persistence and cleanup? Have you considered the security implications of storing verification codes in memory?

5. **Password Security**: I see you're using bcryptjs for password hashing. What salt rounds are you using? How do you enforce password complexity requirements, and what is your password reset mechanism?

### SQL Injection & Input Validation

6. **Parameterized Queries**: I observed that most queries use parameterized queries (prepared statements), which is good. However, I noticed some queries like `UPDATE payroll_processing SET status = 1 WHERE name IN (?)` where you pass an array. How do you ensure this is safe from SQL injection? Can you demonstrate your input validation strategy?

7. **Input Sanitization**: How do you validate and sanitize user inputs before they reach the database? What validation rules are in place for payroll calculations, employee numbers, and financial data?

### Data Protection

8. **Sensitive Data Encryption**: Payroll data contains highly sensitive financial information. Are payroll records encrypted at rest? What encryption mechanisms are in place for data in transit (HTTPS/TLS)?

9. **Audit Trail**: I see you have an `audit_log` table. What information is logged, and how long are audit logs retained? Can you demonstrate how audit logs would help in investigating a payroll discrepancy or security breach?

10. **CORS Configuration**: Your CORS allows specific origins. How do you manage CORS in different environments (development, staging, production)? What prevents unauthorized domains from accessing your API?

---

## 🗄️ DATABASE-RELATED QUESTIONS

### Database Design & Schema

11. **Database Normalization**: Looking at your payroll processing queries, I see multiple LEFT JOINs with subqueries using MAX(id). Can you explain your database normalization strategy? Why are you using MAX(id) to get the latest records instead of proper foreign key relationships with timestamps?

12. **Data Integrity**: I notice queries like:
   ```sql
   LEFT JOIN (
     SELECT employeeNumber, MAX(id) as max_id
     FROM remittance_table
     GROUP BY employeeNumber
   ) r_max ON p.employeeNumber = r_max.employeeNumber
   ```
   How do you ensure data integrity when multiple remittance records exist for the same employee? What prevents orphaned records or inconsistent data states?

13. **Indexes & Performance**: What indexes have you created on your payroll-related tables? Can you show me the execution plan for a complex payroll query? How do you handle performance optimization for queries joining 8+ tables?

14. **Foreign Key Constraints**: Do you have foreign key constraints defined in your database schema? If not, how do you maintain referential integrity? What happens if an employee is deleted but has payroll records?

15. **Transaction Management**: In your payroll finalization endpoint, I see multiple database operations. Are these wrapped in transactions? What is your rollback strategy if one operation fails during payroll processing?

### Database Administration

16. **Connection Pooling**: Your connection pool has a limit of 10 connections. How did you determine this number? What happens when all connections are exhausted? Do you have connection timeout and retry mechanisms?

17. **Database Backups**: What is your database backup strategy? How frequently are backups taken, and how long are they retained? Can you demonstrate a restore procedure?

18. **Database Migrations**: I see you have migration scripts. How do you version control database schema changes? What is your process for applying migrations in production without downtime?

19. **Data Archiving**: Payroll data accumulates over time. What is your data archiving strategy? How do you handle historical payroll records, and what is your data retention policy?

20. **Query Optimization**: Some of your payroll queries are very complex with multiple nested subqueries. Have you analyzed query performance? What tools do you use for query optimization, and can you show query execution times?

---

## ⚙️ SYSTEM ADMINISTRATION QUESTIONS

### System Architecture

21. **Error Handling**: I see `console.log` and `console.error` statements throughout your code. What is your production logging strategy? How do you handle and log errors in production? Do you use a centralized logging system?

22. **Environment Configuration**: How do you manage environment variables across different environments? What prevents sensitive configuration from being committed to version control?

23. **API Rate Limiting**: Do you have rate limiting implemented for your API endpoints? How do you prevent abuse, especially for authentication and payroll processing endpoints?

24. **System Monitoring**: What monitoring and alerting mechanisms are in place? How do you detect system failures, performance degradation, or security breaches?

25. **Scalability**: Your system appears to be a monolithic application. How does it scale with increasing number of employees? What is your strategy for handling peak payroll processing loads?

### Deployment & Operations

26. **Deployment Process**: What is your deployment process? How do you ensure zero-downtime deployments? What is your rollback procedure?

27. **Disaster Recovery**: What is your disaster recovery plan? How long would it take to restore the system in case of a catastrophic failure? Have you tested your recovery procedures?

28. **System Maintenance**: How do you handle system maintenance and updates? What is your process for applying security patches and updates?

29. **Resource Management**: How do you monitor server resources (CPU, memory, disk)? What are your resource limits, and how do you handle resource exhaustion?

30. **Session Management**: How do you handle user sessions? What happens to active sessions when a user's role is changed or when they are deactivated?

---

## 📊 RULE-BASED CALCULATION & FORMULA PARSING QUESTIONS

### Formula Implementation

31. **Formula Parsing Algorithm**: Your research title mentions "formula parsing algorithms," but I see hardcoded calculations in the frontend (e.g., `grossSalary * 0.0055555525544423 * h`). Can you explain your formula parsing algorithm? Where is the formula parsing engine implemented?

32. **Rule-Based System**: Where are the payroll calculation rules stored? Are they in the database, configuration files, or hardcoded? How can administrators modify calculation rules without code changes?

33. **Formula Versioning**: Payroll rules may change over time (e.g., tax rate changes). How do you handle formula versioning? Can you calculate payroll for a past period using the rules that were in effect at that time?

34. **Calculation Accuracy**: I see calculations like:
   ```javascript
   const PhilHealthContribution = Math.floor(((grossSalary * 0.05) / 2) * 100) / 100;
   ```
   Why are you using `Math.floor` and then dividing by 100? How do you ensure calculation accuracy and handle rounding errors in financial calculations?

35. **Formula Validation**: How do you validate that payroll formulas are correct? Do you have unit tests for each calculation? How do you ensure formulas comply with government regulations (GSIS, PhilHealth, Pag-IBIG)?

36. **Dynamic Formula Updates**: If a government agency changes a contribution rate, how quickly can you update the formula? Do you need to redeploy the application, or can formulas be updated dynamically?

37. **Calculation Auditability**: How can you prove that a payroll calculation is correct? Can you show the step-by-step calculation for a specific employee's payroll, including all formulas and values used?

38. **Formula Testing**: How do you test payroll calculations? Do you have test cases with known inputs and expected outputs? How do you handle edge cases (e.g., zero hours worked, negative values)?

39. **Multi-Employee Processing**: When processing payroll for multiple employees, are calculations done sequentially or in parallel? How do you ensure consistency when processing hundreds or thousands of employees?

40. **Formula Documentation**: Where is the documentation for each payroll formula? How would a new developer understand why `abs = grossSalary * 0.0055555525544423 * h + grossSalary * 0.0000925948584897 * m`?

---

## 🔍 SPECIFIC TECHNICAL QUESTIONS

### Code Quality & Best Practices

41. **Code Duplication**: I notice similar calculation logic in multiple places (e.g., `PayrollProcessing.jsx` and `Payroll.js`). How do you handle code duplication? Do you have a centralized calculation service?

42. **Error Recovery**: If a payroll calculation fails midway through processing 100 employees, how do you recover? Do you have partial processing capabilities, or must you restart from the beginning?

43. **Data Validation**: Before finalizing payroll, what validations are performed? How do you ensure that all required fields are present and within acceptable ranges?

44. **Concurrent Access**: What happens if two administrators try to process payroll for the same employee simultaneously? How do you handle concurrent modifications?

45. **Data Consistency**: Payroll data is spread across multiple tables (`payroll_processing`, `remittance_table`, `philhealth`, `department_assignment`, etc.). How do you ensure data consistency across these tables?

### Integration & Interoperability

46. **API Documentation**: Is your API documented? What format (OpenAPI/Swagger, Postman, etc.)? How do external systems integrate with your payroll system?

47. **Data Export**: How do you export payroll data for external systems (accounting software, banks)? What formats are supported, and how is data validated during export?

48. **Integration Testing**: How do you test the integration between HRIS modules and payroll? What test data do you use, and how do you ensure test data doesn't affect production?

### Compliance & Regulations

49. **Regulatory Compliance**: How do you ensure payroll calculations comply with Philippine labor laws, tax regulations, and government agency requirements (BIR, GSIS, PhilHealth, Pag-IBIG)?

50. **Data Privacy**: How do you comply with the Data Privacy Act of the Philippines? What measures are in place to protect employee personal and financial information?

51. **Audit Requirements**: What reports can you generate for internal and external audits? How do you ensure payroll records are tamper-proof and auditable?

---

## 🎯 RESEARCH-SPECIFIC QUESTIONS

### Algorithm & Methodology

52. **Formula Parsing Algorithm Details**: Can you provide a detailed explanation of your formula parsing algorithm? What parsing techniques do you use (recursive descent, shunting yard, etc.)? How do you handle operator precedence and parentheses?

53. **Rule Engine Architecture**: What is the architecture of your rule-based calculation engine? How are rules evaluated? Do you use a rule engine library, or is it custom-built?

54. **Performance Analysis**: What is the time complexity of your formula parsing algorithm? How does it perform with complex formulas? Have you benchmarked it against alternative approaches?

55. **Scalability of Formula Engine**: How does your formula parsing engine scale? Can it handle thousands of employees with different calculation rules simultaneously?

56. **Research Contribution**: What is the novel contribution of your research? How does your formula parsing approach differ from existing payroll systems? What are the advantages of your method?

57. **Validation & Testing**: How have you validated your rule-based calculation system? What test cases have you used? Have you compared results with manual calculations or existing systems?

58. **Limitations**: What are the limitations of your current implementation? What scenarios cannot be handled by your formula parsing algorithm?

59. **Future Enhancements**: What improvements would you make to the formula parsing and rule-based calculation system? How would you extend it to support more complex scenarios?

60. **Research Methodology**: What methodology did you follow in developing this system? Did you follow a specific software development lifecycle (SDLC)? How did you gather requirements from stakeholders?

---

## 📝 ADDITIONAL CONCERNS

### Code Observations

61. **Hardcoded Values**: I see many hardcoded calculation values (e.g., `0.0055555525544423`, `0.0000925948584897`). What do these values represent? Why aren't they stored in a configuration table?

62. **Frontend Calculations**: Payroll calculations appear to be done in the frontend. Why is this? Shouldn't sensitive financial calculations be performed on the backend to prevent tampering?

63. **Error Messages**: Some error messages are generic (e.g., "Internal server error"). How do you provide meaningful error messages to users while not exposing system internals?

64. **Code Organization**: I see duplicate authentication middleware in multiple files. How do you maintain consistency? Have you considered creating a shared middleware module?

65. **Testing**: Do you have automated tests (unit tests, integration tests)? What is your test coverage? How do you test payroll calculations?

---

## 🎓 PRESENTATION & DOCUMENTATION

66. **System Documentation**: Is there comprehensive documentation for system administrators? How would a new administrator learn to use and maintain the system?

67. **User Training**: How are end-users trained on the system? What training materials and documentation are available?

68. **Change Management**: How are system changes communicated to users? What is your process for handling user feedback and feature requests?

---

## 💡 FINAL QUESTIONS

69. **System Readiness**: Is this system currently in production use at EARIST? How many employees are using it? What has been the user feedback?

70. **Lessons Learned**: What were the biggest challenges you faced during development? What would you do differently if you were to start over?

71. **Research Impact**: What is the practical impact of this research? How does it benefit EARIST and other institutions? What are the measurable improvements over previous systems?

72. **Future Work**: What are your plans for future enhancements? Are there features you wanted to implement but couldn't due to time constraints?

---

## 📌 NOTES FOR THE PRESENTER

These questions are designed to test:
- **Security knowledge**: Understanding of authentication, authorization, data protection
- **Database expertise**: Schema design, optimization, integrity, administration
- **System administration**: Deployment, monitoring, maintenance, disaster recovery
- **Research depth**: Understanding of the formula parsing algorithm and rule-based system
- **Practical application**: Real-world implementation and operational concerns

**Recommendation**: Be prepared to:
1. Demonstrate the formula parsing algorithm with examples
2. Show database schema and explain design decisions
3. Discuss security measures and compliance
4. Explain the rule-based calculation engine architecture
5. Provide performance metrics and test results
6. Show how the system handles edge cases and errors

