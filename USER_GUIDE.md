# PTC Furnitures - Step-by-Step User Guide & Operations Manual

This guide explains how to interact with the PTC Furnitures platform across all three user roles: **Storefront Customers**, **Partner Dealers**, and **Storefront Administrators**.

---

## 👥 1. Storefront Customers (Public Users)

As a customer browsing the storefront, you can explore product designs, view catalogs, and download high-resolution pictures.

### Browsing the Product Catalog
1. Go to the **Collections** page (`/collections`).
2. **Filter by Brand**: Click the brand selector in the filter bar to isolate items from a specific manufacturer (e.g., PTC GOLD, REX, ALTECH).
3. **Filter by Category/Material**: Narrow down your search by selecting categories (e.g., Sofas, Beds, Tables) or materials (e.g., Solid Teak, Steel, Ply).
4. **Sort Results**: Arrange items using the sort dropdown menu (e.g., Sort by Featured, Newest, or Name).

### Viewing Product Details
* Hover over any product card on the collection grid to see additional angles/images.
* Click on a product to open the **Details Dialog**.
* In the dialog, you will see a high-definition image grid showing all available product photos side-by-side.
* Directly beneath the images, you can read the item specifications, designer details, custom metadata (e.g., dimensions), and download buttons.

### Downloading High-Resolution Images
1. In the Product Details dialog, click **Download Original Image**.
2. A small, secure form will open requesting your **Name** and **Mobile Number**.
3. Fill in your details and click **Confirm**.
4. The system will log your interaction and instantly download a high-definition, clean copy of the product image to your device.

### Reading & Printing Catalog Brochures
1. Visit the **Catalogs** bookshelf page (`/catalogs`).
2. Select any booklet to open it:
   - **PDF Brochures**: Opens an interactive PDF viewer directly inside your browser.
   - **Thematic Catalogues**: Displays a beautiful, custom editorial magazine page layout.
3. Use the floating **Print / Save PDF** action button at the bottom-right corner to print the brochure layout or save a formatted PDF copy to your computer.

### Finding Payment Information
* If you are purchasing custom suites, go to the **Payment & Bank Info** page (`/payment`).
* Review the active corporate bank transfer accounts, IFSC codes, and verified UPI handles.
* Hover over the QR code card to enlarge or scan it directly from your screen.

---

## 🤝 2. Partner Dealers (Wholesalers & Retailers)

If you are a retailer applying for showroom credits, partnerships, or dealer pricing, follow these steps:

### Submitting a Dealer Application
1. Head to the **Dealers Portal** (`/dealers`).
2. **Choose Language**: Use the switcher at the top right to view the form in either **English** or **Hindi** (हिंदी).
3. Fill out your registration details:
   * Owner/Business Name
   * Active Phone Number
   * City/Town Location
   * Business Email Address
4. Click the **Submit Application** button.

### What Happens Next?
* Upon submission, the portal records your lead in the database and prepares a pre-filled direct message.
* You will be immediately redirected to a **direct WhatsApp chat link** (`wa.me`) addressed to the sales team, containing your submission details. Click "Send" in WhatsApp to initiate contact with the showroom managers.

---

## 🛡️ 3. Storefront Administrators (Admins)

The Admin Panel (`/admin`) allows you to run all business operations. Here is how to complete daily administrative workflows:

### Logging In
1. Navigate to `/login` or `/admin`.
2. Enter your credentials. Once verified, you will be redirected to the secure **Overview Hub** showing current product counts, brands, and database status.

### ➕ Managing Inventory (Adding & Editing Products)
1. Go to the **Products** page (`/admin/products`).
2. Click **Add Product** at the top right.
3. Fill out the details:
   * **Name**: The design name.
   * **Brand**: Select from the dropdown (e.g., PTC GOLD).
   * **Material**: Main materials used.
   * **Crafted By**: Designer name.
   * **Tags**: Category identifiers (comma-separated).
4. **Custom Fields**: Click **Add Field** to specify custom dimensions, wood polish types, or load capacities.
5. **Image Upload**: Drag and drop product photos. The server will automatically generate transparent, watermarked WebP versions.
6. Click **Save Product**.

### ↕️ Sorting & Arranging Products
To control the display sequence of products on the public storefront:
1. Go to `/admin/products`.
2. Click **Rearrange Products**.
3. Use the arrow handles next to each product card to drag and drop them, or use the **Up/Down/Swap** button controls to adjust their sequence.
4. Click **Save Presentation Order** at the bottom to write the new layout sequence to the database.

### 🌟 Curating the Homepage Premium Collection
To update the premium showcase on the landing page:
1. Go to the **Premium Products** section (`/admin/premium`).
2. **Update Content**: Edit the Homepage Section Header, Subtitle description, and featured categories.
3. **Feature Products**: Use the search input to find catalog items, and check/uncheck them to add or remove them from the premium collection.
4. **Arrange order**: Rearrange the selected premium products by dragging them up or down.
5. Click **Save Homepage Settings**.

### 📖 Creating Brochure Bookshelves
1. Navigate to the **Catalogs** panel (`/admin/catalogs`).
2. Click **Create Catalog**.
3. **Choose Type**:
   * **PDF Upload**: Give it a title and upload the PDF file.
   * **Custom Dynamic Theme**:
     1. Choose a layout stylesheet: **Minimalist White**, **Elegant Gold**, or **Sleek Dark**.
     2. Select a target manufacturer brand.
     3. Select the products you want to include.
     4. Rearrange the selected products to define page sequencing.
4. Click **Publish Brochure**.

### 📊 Reviewing Leads & Analytics
* **Dealer Applications**: Go to `/admin/leads` to view retail applications. Toggle their status (`New`, `Contacted`, `Approved`, `Rejected`) to update your tracker. Review the message delivery column to confirm notification dispatches.
* **Download Logs**: Go to `/admin/download-leads` to view a list of prospective buyers who saved product photos or catalogs, along with their names and mobile numbers.

### 🏦 Configuring Bank & Payment Displays
1. Go to `/admin/banking`.
2. Click **Add Bank Account** or edit existing entries.
3. Enter IFSC codes, Bank Names, and Account details. Upload a JPG/PNG UPI QR code image.
4. Use the **Active** toggle switch. Only accounts marked active will display on the public `/payment` screen.

### 🏷️ Modifying Brand Watermarks
1. Go to `/admin/brands`.
2. Edit an existing brand's configurations:
   * Upload updated manufacturer logo graphics.
   * Enter alias spelling variants.
   * Adjust **Watermark Opacity** (0% to 100%) and sizing.
3. Click **Update Brand Settings**. The server will automatically update the watermark layers on all existing images associated with that brand in the background.
