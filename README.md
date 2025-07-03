# Health Flex - Timer App

A modern, feature-rich timer application built with React Native and Expo, designed for productivity tracking and time management across multiple activities.

## 🚀 Features

### Core Timer Functionality
- **Multiple Custom Timers**: Create and manage unlimited custom timers with personalized names and durations
- **Pre-built Default Timers**: Ready-to-use timers for common activities (Workout, Study, Break, Meditation)
- **Real-time Progress Tracking**: Visual progress bars and countdown displays
- **Timer Controls**: Start, pause, reset, and restart functionality
- **Completion Notifications**: Celebratory modal with action options when timers complete

### User Experience
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **Swipe-to-Delete**: Intuitive gesture-based deletion for custom timers (default timers protected)
- **Category Organization**: Organize timers by categories (Work, Health, Personal, Study)
- **Bulk Actions**: Start all, pause all, or reset all timers simultaneously
- **Responsive Design**: Optimized for various screen sizes and orientations

### Data Management
- **History Tracking**: Complete session history with timestamps and categories
- **Statistics Dashboard**: Today's activity overview with completion counts
- **Persistent Storage**: Automatic saving of timers, preferences, and history
- **Data Export**: View detailed session history organized by date

### Navigation & Interface
- **Tab Navigation**: Three main screens (Home, Add Timer, History)
- **Intuitive UI**: Clean, modern interface with clear visual hierarchy
- **Loading States**: Smooth loading indicators for better user feedback
- **Error Handling**: Graceful error management and user notifications

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Expo CLI (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health_flex/TimerApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

### Running the App

#### For Development
```bash
# Start Metro bundler
npm start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator (macOS only)
npm run web        # Web browser
```

#### Platform-Specific Instructions

**Android:**
- Install Android Studio and set up an emulator, or
- Enable Developer Options and USB Debugging on a physical device
- Run `npm run android` or scan QR code with Expo Go app

**iOS:**
- Requires macOS with Xcode installed
- Use iOS Simulator or physical device with Expo Go app
- Run `npm run ios` or scan QR code with camera app

**Web:**
- Run `npm run web` to launch in browser
- Fully functional web version with responsive design

## 🏗️ Architecture Overview

### Project Structure
```
TimerApp/
├── components/          # Reusable UI components
│   ├── Timer.js        # Core timer component with controls
│   ├── SwipeableTimer.js # Timer with swipe-to-delete functionality
│   ├── ProgressBar.js  # Animated progress bar component
│   └── CompletionModal.js # Timer completion celebration modal
├── screens/            # Main application screens
│   ├── HomeScreen.js   # Timer management and control center
│   ├── AddTimerScreen.js # Timer creation and editing
│   └── HistoryScreen.js # Session history and statistics
├── contexts/           # React Context providers
│   └── ThemeContext.js # Dark/light mode theme management
├── utils/             # Utility functions and helpers
│   ├── storage.js     # AsyncStorage operations
│   └── history.js     # History management utilities
├── assets/            # Static assets (icons, images)
└── App.js            # Root component with navigation setup
```

### Design Patterns

**Component Architecture:**
- Functional components with React Hooks
- Context API for global state management (theme)
- Forward refs for component method exposure
- Modular, reusable component design

**State Management:**
- Local state with useState for component-specific data
- useEffect for lifecycle management and side effects
- AsyncStorage for persistent data storage
- Context API for theme state sharing

**Navigation:**
- React Navigation v7 with bottom tab navigator
- Screen-based architecture with clear separation
- Deep linking support for future enhancements

## 📦 Dependencies Explanation

### Core Framework
- **React Native (0.79.5)**: Cross-platform mobile app framework
- **Expo (~53.0.16)**: Development platform and runtime for React Native
- **React (19.0.0)**: Core React library for component architecture

### Navigation
- **@react-navigation/native (^7.1.14)**: Navigation library for React Native
- **@react-navigation/bottom-tabs (^7.4.2)**: Bottom tab navigator implementation
- **@react-navigation/stack (^7.4.2)**: Stack navigator for future use

### Animation & Gestures
- **react-native-reanimated (^3.18.0)**: High-performance animations library
- **react-native-gesture-handler (^2.27.1)**: Native gesture recognition
- **react-native-screens (~4.11.1)**: Native screen components for better performance

### Storage & Utilities
- **@react-native-async-storage/async-storage (^2.2.0)**: Persistent local storage
- **react-native-safe-area-context (5.4.0)**: Safe area handling for notches/status bars

### Development
- **@babel/core (^7.20.0)**: JavaScript compiler for modern syntax support
- **@expo/metro-runtime (~5.0.4)**: Metro bundler runtime for Expo

## 💭 Development Assumptions

### Design Assumptions
1. **Mobile-First Design**: Optimized primarily for mobile devices with responsive web support
2. **Portrait Orientation**: UI designed for portrait mode with landscape compatibility
3. **Touch Interactions**: Primary interaction method is touch with gesture support

### Data Storage Assumptions
1. **Local Storage Only**: All data stored locally on device (no cloud sync)
2. **JSON Serialization**: Complex objects stored as JSON strings in AsyncStorage
3. **Data Persistence**: App state persists between sessions and app restarts

### User Behavior Assumptions
1. **Single User**: App designed for individual use (no multi-user support)
2. **Timer Duration Range**: Timers expected to be between 30 seconds and 24 hours
3. **Category Usage**: Users will utilize category system for organization

### Technical Assumptions
1. **Modern Devices**: Target devices with React Native 0.79+ compatibility
2. **Storage Availability**: Device has sufficient storage for timer data and history
3. **JavaScript Enabled**: Web version assumes JavaScript is enabled

### Business Logic Assumptions
1. **Default Timer Protection**: Built-in timers cannot be deleted to maintain consistency
2. **History Retention**: No automatic cleanup of old history data
3. **Theme Preference**: User preference for dark/light mode should persist

## 🎨 Key Features Description

### Home Screen
The central hub for timer management featuring:
- Grid layout of available timers with visual status indicators
- Bulk action controls for managing multiple timers simultaneously
- Real-time progress updates and countdown displays
- Quick access to start, pause, and reset individual timers

### Add Timer Screen
Intuitive timer creation interface with:
- Custom name input with validation
- Duration selection with hour/minute/second precision
- Category assignment with predefined options
- Form validation and error handling
- Save/clear functionality with user feedback

### History Screen
Comprehensive activity tracking featuring:
- Today's statistics dashboard with completion summaries
- Chronological session history with detailed timestamps
- Category-based filtering and organization
- Data export capabilities for external analysis
- Clear history functionality with confirmation dialogs

### Theme System
Advanced theming implementation including:
- Toggle between dark and light modes
- Semantic color system for consistent design
- Automatic persistence of user preference
- Smooth transitions between theme states
- Comprehensive coverage across all UI elements

## 🔧 Development Features

### Code Quality
- TypeScript-ready component structure
- Comprehensive error handling and validation
- Performance optimizations with memo and callbacks
- Accessibility considerations for screen readers
- Consistent code formatting and documentation

### Performance Optimizations
- Efficient re-rendering with proper dependency arrays
- Animated components using native driver when possible
- Lazy loading and code splitting strategies
- Memory management for timer intervals
- Optimized AsyncStorage operations

## 🚀 Future Enhancements

Potential areas for expansion:
- Cloud synchronization and backup
- Timer templates and presets
- Advanced statistics and analytics
- Social sharing of achievements
- Widget support for home screen
- Apple Watch / Wear OS companion apps
- Timer groups and workflows
- Export data to CSV/JSON formats

---

## 📱 Getting Started

1. Follow the setup instructions above
2. Run `npm start` to launch the development server
3. Choose your preferred platform (iOS/Android/Web)
4. Start creating custom timers and track your productivity!

For questions or issues, please refer to the Expo documentation or React Native guides for platform-specific troubleshooting. 
