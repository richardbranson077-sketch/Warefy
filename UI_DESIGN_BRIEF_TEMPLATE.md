# UI Design Brief Template for Warefy Supply Chain Platform

## 📋 Instructions for UI Designer

Please provide detailed specifications for the UI/UX design using this template. The more specific you are, the better the implementation will be.

---

## 1. Page/Component Information

**Page/Component Name:**
- What is this page/component called? (e.g., "Inventory Management Dashboard", "Order Details Modal")

**Purpose:**
- What is the main goal of this page/component?
- What problem does it solve for the user?

**User Type:**
- Who will use this? (e.g., Admin, Warehouse Manager, Driver, Customer)

---

## 2. Layout & Structure

**Overall Layout:**
- Describe the general layout (e.g., "Full-width page with sidebar", "Modal overlay", "Card-based grid")
- Should it have a header? Sidebar? Footer?
- What sections should it contain?

**Grid/Spacing:**
- How should content be organized? (e.g., "3-column grid on desktop, 1-column on mobile")
- Any specific spacing requirements?

**Responsive Behavior:**
- How should it look on mobile devices?
- How should it look on tablets?
- How should it look on desktop?

---

## 3. Color Scheme & Theme

**Primary Colors:**
- What are the main colors? (Provide hex codes if possible, e.g., #3b82f6 for blue)
- Should it use gradients? If yes, describe them

**Background:**
- What should the background look like? (e.g., "Dark gradient from #1a1a2e to #16213e", "Light gray #f5f5f5")

**Accent Colors:**
- What colors for buttons, links, highlights?
- Any specific color meanings? (e.g., green for success, red for errors)

**Dark/Light Mode:**
- Should it support both themes?
- Which is the default?

---

## 4. Typography

**Font Family:**
- What fonts should be used? (e.g., "Inter for headings, Roboto for body")
- Should we use Google Fonts or system fonts?

**Font Sizes:**
- Headings (H1, H2, H3, etc.)
- Body text
- Small text (captions, labels)

**Font Weights:**
- Which weights for different elements? (e.g., "Bold 700 for headings, Regular 400 for body")

---

## 5. Components & Elements

### Cards/Containers
- What style? (e.g., "Glassmorphism with backdrop blur", "Solid with shadow", "Bordered")
- Border radius? (e.g., "Rounded-xl (12px)", "Sharp corners")
- Shadow/elevation?
- Hover effects?

### Buttons
- Primary button style (color, size, shape, hover effect)
- Secondary button style
- Disabled state appearance
- Icon buttons?

### Input Fields
- Style (e.g., "Outlined", "Filled", "Underlined")
- Focus state appearance
- Error state appearance
- Placeholder text style

### Tables/Lists
- How should data be displayed?
- Row hover effects?
- Alternating row colors?
- Pagination style?

### Charts/Graphs
- What type of charts? (Line, Bar, Pie, Area, etc.)
- Color scheme for charts
- Should they be animated?
- Tooltip style

### Icons
- Icon library preference? (e.g., Lucide, Heroicons, Font Awesome)
- Icon size and color
- Where should icons be used?

---

## 6. Interactions & Animations

**Hover Effects:**
- What should happen when users hover over elements?
- Scale? Color change? Shadow? Glow?

**Click/Tap Effects:**
- Any ripple effects or feedback?

**Transitions:**
- Should elements fade in/out?
- Slide animations?
- Duration of animations? (e.g., "300ms ease-in-out")

**Loading States:**
- How should loading be indicated? (Spinner, skeleton, progress bar)
- Loading animation style?

**Micro-interactions:**
- Any special animations? (e.g., "Confetti on success", "Shake on error")

---

## 7. Data Display

**What Data Should Be Shown:**
- List all data fields that need to be displayed
- For each field, specify:
  - Label/name
  - Format (e.g., "Currency with 2 decimals", "Date as MM/DD/YYYY")
  - Is it required or optional?

**Data Visualization:**
- Should any data be shown as charts/graphs?
- What metrics are most important?
- Any real-time updates needed?

---

## 8. User Actions

**Primary Actions:**
- What are the main actions users can take? (e.g., "Create Order", "Update Inventory")
- Where should action buttons be placed?

**Secondary Actions:**
- Any additional actions? (e.g., "Export to CSV", "Filter", "Sort")

**Confirmation/Validation:**
- Should actions require confirmation?
- How should success/error messages appear?

---

## 9. Visual Style & Aesthetics

**Overall Vibe:**
- Modern? Professional? Playful? Minimal? Bold?
- Any specific design inspiration? (Provide links if possible)

**Visual Effects:**
- Glassmorphism? Neumorphism? Flat design?
- Gradients? Shadows? Glows?
- Blur effects?

**Branding:**
- Should it match any existing brand guidelines?
- Logo placement and size?

---

## 10. Special Requirements

**Accessibility:**
- Any specific accessibility needs?
- Color contrast requirements?
- Keyboard navigation?

**Performance:**
- Should animations be minimal for performance?
- Lazy loading needed?

**Browser Support:**
- Which browsers must be supported?

**Mobile-First:**
- Should design prioritize mobile or desktop?

---

## 11. Reference Examples (Optional)

**Similar Designs:**
- Links to websites/apps with similar style
- Screenshots or mockups (if available)

**Specific Elements:**
- "I like the card style from [website]"
- "Use a similar chart to [example]"

---

## 12. Backend Data Connection

**API Endpoints:**
- What data comes from the backend?
- List the API endpoints this page will use

**Data Structure:**
- Provide sample JSON response (if available)
- What fields are available?

**Real-time Updates:**
- Should any data update automatically?
- WebSocket connections needed?

---

## 📝 Example Filled Template

Here's an example of how to fill this out:

### Page Name: **Inventory Dashboard**

### Purpose:
Display real-time inventory levels across all warehouses with alerts for low stock items.

### Layout:
- Full-width page with top navigation
- 4-column grid for summary cards at top
- 2-column layout below: Left = inventory table (2/3 width), Right = alerts sidebar (1/3 width)

### Colors:
- Background: Dark gradient from #0f172a to #1e293b
- Primary: Blue #3b82f6
- Success: Green #10b981
- Warning: Orange #f59e0b
- Error: Red #ef4444

### Cards:
- Glassmorphism style with backdrop-blur
- Border: 1px solid rgba(255,255,255,0.1)
- Border radius: 16px
- Hover: Scale 1.05, add glow shadow matching card color

### Buttons:
- Primary: Gradient from blue-600 to cyan-600, white text, rounded-lg, hover scale 1.05
- Secondary: Transparent with border, hover fill with color

### Charts:
- Area chart for inventory trends over time
- Gradient fill from primary color
- Animated on load
- Tooltip with dark background and rounded corners

### Data to Display:
- Total Items (number)
- Total Value (currency, $XX,XXX.XX)
- Low Stock Items (number with red badge if > 0)
- Warehouse Utilization (percentage with progress bar)

### Actions:
- "Add Item" button (top right, primary style)
- "Export CSV" button (secondary style)
- Filter by warehouse (dropdown)
- Search by SKU (search input)

### Animations:
- Cards fade in on load with stagger effect (100ms delay between each)
- Hover effects: 300ms ease-in-out
- Chart animates over 1 second

---

## ✅ Submission Checklist

Before submitting your design brief, make sure you've covered:
- [ ] Page purpose and user type
- [ ] Layout structure and responsive behavior
- [ ] Color scheme with specific colors
- [ ] Typography details
- [ ] Component styles (cards, buttons, inputs)
- [ ] Interaction and animation preferences
- [ ] Data to be displayed
- [ ] User actions and their placement
- [ ] Overall visual style
- [ ] Any reference examples

---

**Note to Developer:** Once you receive this completed brief, you'll have all the information needed to implement the design accurately while maintaining backend connections.
