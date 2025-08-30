# 🚀 Medu Onboarding System

A comprehensive onboarding flow for new users to personalize their language learning experience on Medu.

## ✨ Features

### **6-Step Onboarding Flow**

1. **Welcome** - Introduction to Medu and its features
2. **Language Selection** - Choose target language with search functionality
3. **Learning Preferences** - Content type, difficulty level, and study intensity
4. **Learning Goals** - Select from templates or add custom goals
5. **Profile Setup** - Display name, native language, and experience level
6. **Completion** - Summary and next steps

### **Smart User Experience**

- **Progress Tracking** - Visual progress bar and step indicators
- **Data Persistence** - Saves progress locally during onboarding
- **Responsive Design** - Mobile-first design with smooth transitions
- **Brand Consistency** - Follows Medu's cozy, clean aesthetic

## 🛠️ Technical Implementation

### **File Structure**

```
src/
├── app/onboarding/
│   ├── page.tsx              # Main onboarding page
│   └── layout.tsx            # Onboarding-specific layout
├── components/Onboarding/
│   ├── OnboardingContainer.tsx    # Main container component
│   ├── StepProgress.tsx           # Progress bar and step indicators
│   ├── OnboardingNavigation.tsx   # Back/Next navigation
│   └── steps/
│       ├── WelcomeStep.tsx        # Welcome screen
│       ├── LanguageStep.tsx       # Language selection
│       ├── PreferencesStep.tsx    # Learning preferences
│       ├── GoalsStep.tsx          # Learning goals
│       ├── ProfileStep.tsx        # Profile setup
│       └── CompletionStep.tsx     # Completion screen
├── contexts/
│   └── OnboardingContext.tsx      # State management
├── hooks/
│   └── useOnboardingStatus.ts     # Onboarding status checker
└── types/
    └── onboarding.ts              # TypeScript types
```

### **State Management**

- **OnboardingContext** - Manages current step, user data, and navigation
- **Local Storage** - Persists selections during onboarding
- **Supabase Integration** - Saves final preferences to user profile

### **Data Flow**

1. User starts onboarding → Creates onboarding session
2. Each step updates local state and context
3. On completion → Saves to Supabase user profile
4. Redirects to dashboard with personalized content

## 🚀 Getting Started

### **1. Database Setup**

Run the migration script in your Supabase SQL editor:

```sql
-- Run database-migration.sql in Supabase
-- This adds the required fields to the users table
```

### **2. Install Dependencies**

The onboarding system uses existing dependencies:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Supabase client

### **3. Integration Points**

The system automatically integrates with:

- **AuthContext** - User authentication
- **LanguagePreferenceContext** - Language preferences
- **Existing UI components** - Buttons, cards, inputs

## 📱 User Flow

### **New User Journey**

1. **Sign Up** → User creates account
2. **Redirect** → Automatically redirected to `/onboarding`
3. **Complete Steps** → User goes through 6-step flow
4. **Profile Creation** → Data saved to database
5. **Dashboard Access** → Redirected to personalized dashboard

### **Returning User Journey**

1. **Sign In** → User authenticates
2. **Status Check** → System checks onboarding completion
3. **Conditional Redirect** →
   - If completed → Dashboard
   - If not completed → Onboarding

### **Onboarding Progress**

- **Local Persistence** - Progress saved in localStorage
- **Resume Capability** - Users can continue where they left off
- **Data Validation** - Each step validates required fields

## 🎨 Customization

### **Branding**

- **Colors** - Uses Medu's brand colors (`--color-brand-accent`, etc.)
- **Typography** - Manrope font family
- **Icons** - Lucide React icons
- **Spacing** - Consistent with existing design system

### **Content**

- **Language Options** - Configurable in `languageMapping.ts`
- **Goal Templates** - Editable in `GoalsStep.tsx`
- **Preference Options** - Customizable in respective step components

### **Styling**

- **Responsive Breakpoints** - Mobile-first approach
- **Animation Classes** - Uses existing Tailwind animations
- **Component Variants** - Follows existing UI component patterns

## 🔧 Configuration

### **Environment Variables**

No additional environment variables required. Uses existing Supabase configuration.

### **Database Fields**

The system expects these fields in the `users` table:

- `display_name` - User's display name
- `native_language` - User's native language
- `experience_level` - Learning experience level
- `content_preferences` - JSON object with preferences
- `learning_goals` - Array of goal IDs/descriptions
- `weekly_study_time` - Weekly commitment in minutes
- `onboarding_completed` - Boolean completion status
- `onboarding_completed_at` - Completion timestamp

### **Navigation Behavior**

- **Back Button** - Available on all steps except first
- **Next Button** - Disabled until required fields are completed
- **Step Skipping** - Users can navigate between completed steps
- **Progress Persistence** - Data saved after each step

## 🧪 Testing

### **Manual Testing**

1. **Sign Up Flow** - Create new account and verify onboarding redirect
2. **Step Navigation** - Test back/next navigation between steps
3. **Data Persistence** - Verify localStorage saves progress
4. **Completion Flow** - Test database save and dashboard redirect
5. **Returning Users** - Verify onboarding status check works

### **Edge Cases**

- **Incomplete Data** - Test with missing required fields
- **Browser Refresh** - Verify progress persistence
- **Network Errors** - Test error handling during completion
- **Mobile Responsiveness** - Test on various screen sizes

## 🚨 Troubleshooting

### **Common Issues**

#### **Onboarding Not Starting**

- Check if user is authenticated
- Verify onboarding route is accessible
- Check browser console for errors

#### **Data Not Saving**

- Verify database migration was run
- Check Supabase permissions
- Verify user table has required fields

#### **Navigation Issues**

- Check if OnboardingContext is properly wrapped
- Verify step components are exported correctly
- Check for TypeScript compilation errors

### **Debug Mode**

Enable console logging by adding to `OnboardingContext.tsx`:

```typescript
console.log("Onboarding state:", state);
console.log("Current step:", state.currentStep);
```

## 🔮 Future Enhancements

### **Potential Improvements**

- **A/B Testing** - Different onboarding flows for user segments
- **Analytics** - Track completion rates and drop-off points
- **Personalization** - AI-powered content recommendations
- **Social Features** - Share onboarding results with friends
- **Gamification** - Achievement badges for completion

### **Integration Opportunities**

- **Content API** - Pre-populate with user's language content
- **Goal Tracking** - Connect with existing goal system
- **Progress Analytics** - Use onboarding data for insights
- **Recommendation Engine** - Personalized content suggestions

## 📄 License

This onboarding system is part of the Medu language learning platform and follows the same licensing terms.

---

**Built with ❤️ for language learners everywhere**
