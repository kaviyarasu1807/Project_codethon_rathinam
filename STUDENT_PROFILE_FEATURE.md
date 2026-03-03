# Student Profile Feature

## Overview
Added a comprehensive student profile page accessible from the dashboard navbar, displaying all personal information including contact details, academic information, and address.

## Features Added

### 1. Enhanced Database Schema
Added new fields to the `students` table:
- `mobile_number` - Student's phone number
- `address` - Full residential address
- `college_name` - Name of college/university
- `department` - Academic department (e.g., Computer Science, Mechanical)

### 2. Updated Registration Form
The student registration form now collects:
- Name
- Email
- Password
- Domain (Engineering, Medical, Computer Science, Arts)
- Department
- Mobile Number
- College Name
- Address (textarea for full address)
- Face verification (step 2)

### 3. Profile Navigation
Added "My Profile" button to the student dashboard sidebar:
- Icon: UserCircle
- Accessible from any view
- Highlighted when active (emerald background)
- Only visible to students (not staff)

### 4. Profile Page Design

#### Layout
Two-column responsive grid:
- Left column: Profile card with avatar and verification badge
- Right column: Detailed information cards

#### Profile Card (Left)
- Gradient background (emerald to blue)
- Large circular avatar with UserCircle icon
- Student name (large, bold)
- Role badge (Student)
- Identity Verified badge with ShieldCheck icon
- Animated background orbs for visual appeal

#### Information Cards (Right)
Each detail displayed in a card with:
- Color-coded icon background
- Label (uppercase, small, bold)
- Value (medium font, dark text)
- Rounded corners with stone background

**Information Displayed:**
1. **Email Address** (Blue icon - Mail)
2. **Mobile Number** (Emerald icon - Phone)
3. **Domain** (Purple icon - Cpu/Stethoscope/Code2 based on domain)
4. **Department** (Amber icon - GraduationCap)
5. **College/University** (Indigo icon - Building2)
6. **Address** (Red icon - MapPin)

#### Back to Dashboard Button
- Full-width emerald button
- LayoutDashboard icon
- Returns to overview page

## Technical Implementation

### Backend Changes (server.ts)

#### Database Migration
```sql
ALTER TABLE students ADD COLUMN mobile_number TEXT;
ALTER TABLE students ADD COLUMN address TEXT;
ALTER TABLE students ADD COLUMN college_name TEXT;
ALTER TABLE students ADD COLUMN department TEXT;
```

#### Registration Endpoint Update
```typescript
POST /api/register
Body: {
  name, email, password, role, domain, department,
  face_descriptor, mobile_number, address, college_name
}
```

#### Login Response Enhancement
Returns additional fields:
```typescript
{
  user: {
    id, name, email, role, domain, department,
    face_descriptor, mobile_number, address, college_name
  }
}
```

### Frontend Changes (src/App.tsx)

#### Updated Interfaces
```typescript
interface UserData {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  domain?: string;
  department?: string;
  face_descriptor?: string;
  mobile_number?: string;
  address?: string;
  college_name?: string;
}
```

#### New View State
```typescript
const [view, setView] = useState<
  'overview' | 'quiz' | 'result' | 'admin' | 'analytics' | 'profile'
>('overview');
```

#### New Icons Imported
- `Phone` - Mobile number
- `MapPin` - Address
- `Building2` - College name
- `Mail` - Email
- `UserCircle` - Profile avatar and nav button

## User Flow

### Registration Flow
1. Student fills basic info (name, email, password, role, domain)
2. Student fills additional details (department, mobile, college, address)
3. Student proceeds to face verification (step 2)
4. Face capture and enrollment
5. Registration complete

### Profile Access Flow
1. Student logs into dashboard
2. Clicks "My Profile" in sidebar
3. Views all personal information
4. Can return to dashboard with button

## Visual Design

### Color Scheme
- **Profile Card**: Gradient emerald-600 to blue-600
- **Email**: Blue-100 background, blue-600 icon
- **Mobile**: Emerald-100 background, emerald-600 icon
- **Domain**: Purple-100 background, purple-600 icon
- **Department**: Amber-100 background, amber-600 icon
- **College**: Indigo-100 background, indigo-600 icon
- **Address**: Red-100 background, red-600 icon

### Animations
- Fade in with slide up (Motion/Framer Motion)
- Smooth transitions on hover
- Animated background orbs on profile card

### Responsive Design
- Mobile: Single column stack
- Desktop: Two-column grid (1:2 ratio)
- All cards adapt to screen size

## Data Handling

### Optional Fields
The following fields are optional and show "Not provided" if empty:
- Mobile Number
- College Name
- Address
- Department (only shown if provided)

### Required Fields
- Name
- Email
- Password
- Domain
- Role

### Data Validation
- Email: Must be unique and valid format
- Password: Required for registration
- Mobile: Optional, no format validation (flexible for international numbers)
- Address: Optional, textarea allows multi-line input

## Security Considerations

### Data Privacy
- Profile only accessible to logged-in student
- No profile editing capability (prevents unauthorized changes)
- Data stored securely in SQLite database
- Face descriptor stored as encrypted string

### Access Control
- Profile view only available to students (not staff)
- User must be authenticated to access
- Data fetched from localStorage (session-based)

## Future Enhancements (Potential)

1. **Edit Profile**: Allow students to update their information
2. **Profile Picture Upload**: Replace icon with actual photo
3. **Email Verification**: Send verification email on registration
4. **Phone Verification**: OTP-based mobile number verification
5. **Address Autocomplete**: Google Maps API integration
6. **Social Links**: Add LinkedIn, GitHub, portfolio links
7. **Privacy Settings**: Control what information is visible to staff
8. **Export Profile**: Download profile as PDF
9. **Profile Completion**: Progress bar showing filled fields
10. **Change Password**: Allow password updates from profile

## Benefits

### For Students
- Easy access to personal information
- Verify data accuracy
- Professional profile presentation
- Quick reference for contact details

### For Institution
- Complete student records
- Contact information for emergencies
- Department-wise student organization
- Better student management

### For System
- Comprehensive user profiles
- Better personalization capabilities
- Enhanced data for analytics
- Improved user experience

## Usage Instructions

### For Students
1. Register with complete information
2. Login to dashboard
3. Click "My Profile" in sidebar
4. View all personal details
5. Contact admin if information needs updating

### For Administrators
- Student profile data visible in admin dashboard
- Can view all student details for management
- Use contact information for communication

## Technical Notes

- Profile data persists in localStorage for session
- Database automatically creates new columns on first run
- Backward compatible with existing student records (optional fields)
- No API call needed for profile view (uses cached user data)
- Profile updates require backend endpoint (not yet implemented)

## File Changes Summary

### Modified Files
1. `server.ts`
   - Updated students table schema
   - Modified registration endpoint
   - Enhanced login response

2. `src/App.tsx`
   - Updated UserData interface
   - Added profile view state
   - Enhanced Register component with new fields
   - Added Profile view component
   - Updated sidebar navigation
   - Imported new icons

### New Documentation
- `STUDENT_PROFILE_FEATURE.md` (this file)

## Testing Checklist

- [ ] Register new student with all fields
- [ ] Register student with only required fields
- [ ] Login and verify data in profile
- [ ] Check "Not provided" for empty optional fields
- [ ] Test responsive design on mobile
- [ ] Verify navigation between views
- [ ] Check profile card animations
- [ ] Verify icon colors and styling
- [ ] Test back to dashboard button
- [ ] Verify sidebar highlighting

## Conclusion

The Student Profile feature provides a comprehensive view of student information with an attractive, modern design. The implementation is secure, responsive, and user-friendly, enhancing the overall NeuroPath platform experience.

---

**Feature Status**: ✅ Fully Implemented
**Last Updated**: March 3, 2026
**Version**: 1.0.0
