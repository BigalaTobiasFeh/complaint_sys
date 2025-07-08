# 🎓 Student Matricule Format Guide

## Format Structure
```
UBa + YY + L + NNNN
```

Where:
- **UBa** = Fixed prefix (University of Bamenda)
- **YY** = Last two digits of the year
- **L** = Any single capital letter (A-Z)
- **NNNN** = Four-digit number (0001-9999)

## ✅ Valid Examples

### Year 2025 Students
- `UBa25A0001` - First student, letter A
- `UBa25B1234` - Student 1234, letter B
- `UBa25T1000` - Student 1000, letter T
- `UBa25Z9999` - Last student, letter Z

### Year 2024 Students
- `UBa24A0001` - First student from 2024
- `UBa24M5678` - Student 5678, letter M
- `UBa24X0100` - Student 100, letter X

### Year 2026 Students
- `UBa26A0001` - First student from 2026
- `UBa26K2500` - Student 2500, letter K

## ❌ Invalid Examples

- `uba25A1000` - ❌ Lowercase prefix
- `UBA25A1000` - ❌ All caps prefix
- `UBa2025A1000` - ❌ Full year instead of last 2 digits
- `UBa25a1000` - ❌ Lowercase letter
- `UBa2511000` - ❌ Missing letter
- `UBa25A100` - ❌ Only 3 digits instead of 4
- `UBa25A10000` - ❌ 5 digits instead of 4
- `UBa25AB1000` - ❌ Two letters instead of one

## 🔧 Implementation Details

### Frontend Validation
- **Registration Form**: Real-time validation with helpful error messages
- **Login Form**: Format validation before submission
- **Placeholder Text**: Shows example format `UBa25T1000`
- **Helper Text**: Explains the format structure

### Backend Validation
- **Database Constraint**: PostgreSQL regex pattern `^UBa\d{2}[A-Z]\d{4}$`
- **API Validation**: Server-side validation in authentication service
- **Error Handling**: Clear error messages for invalid formats

### Database Storage
- **Field Type**: VARCHAR(50) with UNIQUE constraint
- **Index**: Indexed for fast lookup during login
- **Case Sensitive**: Exact format matching required

## 🎯 Usage in Application

### Student Registration
1. Student enters matricule in format `UBa25T1000`
2. System validates format in real-time
3. Shows error if format is incorrect
4. Stores in database with unique constraint

### Student Login
1. Student enters matricule and password
2. System validates matricule format
3. Looks up student by matricule
4. Authenticates and redirects to dashboard

### Admin/Officer Management
- Admins can search students by matricule
- Officers can view students in their department
- Reports can be filtered by matricule patterns

## 📊 Matricule Statistics

### Capacity per Year
- **Letters Available**: 26 (A-Z)
- **Numbers per Letter**: 9,999 (0001-9999)
- **Total per Year**: 259,974 possible matricules
- **More than sufficient** for university enrollment

### Department Assignment
The letter in the matricule can optionally represent departments:
- **A-C**: Engineering departments
- **D-F**: Science departments  
- **G-I**: Arts departments
- **J-L**: Business departments
- **M-O**: Medical departments
- **P-R**: Agriculture departments
- **S-U**: Technology departments
- **V-Z**: General/Other departments

*Note: This is optional and can be implemented later if needed.*

## 🚀 Ready to Use!

The matricule format is now implemented and validated throughout the system:
- ✅ Registration form with validation
- ✅ Login form with validation  
- ✅ Database constraints
- ✅ Error handling
- ✅ User-friendly messages

Students can now register and login using the proper UBa format!
