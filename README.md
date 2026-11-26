# Anderson Luxury Hampers

An Indonesian-first, bilingual (Bahasa Indonesia / English) luxury gifting website for Anderson Luxury Hampers.

## Live website

https://andersonluxuryhampers.github.io/Anderson-Luxury-Hampers/

## Brand and site features

- Indonesian is the default language; visitors can switch to English with the ID / EN control.
- Responsive layout for desktop, tablet and mobile.
- Collections for chocolate and gourmet gifts, beauty and self-care, corporate hampers, tumblers, and celebration gifts.
- Product photography is stored locally in the repository under `images/`.
- WhatsApp enquiry: https://wa.me/6289673642072
- Email: andersonhampers@gmail.com
- Facebook: https://www.facebook.com/profile.php?id=61576396354021

## Publishing

The GitHub Actions workflow at `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever changes are pushed to `main`. It can also be started manually from the Actions tab.

## Main files

- `index.html` — live bilingual homepage, styling and language-switching behavior.
- `preview.html` — retained design preview.
- `images/` — local product and collection photography.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Order tracking and staff enquiries

- Customer tracking: `tracking.html` (Bahasa Indonesia) and `en/tracking.html` (English).
- Staff dashboard: `staff.html` (Bahasa Indonesia) and `en/staff.html` (English). These pages are not linked from the public navigation and require Supabase Auth sign-in plus a protected `app_metadata.role` of `staff` or `admin`.
- Contact enquiries are submitted to the Supabase Edge Function and stored in the `public.enquiries` table.
- Backend project: Supabase project `yrdyxkuxcfcopywyghao` (Tokyo region).
- Edge Function: `order-api`. It handles verified customer tracking, enquiry submissions, and staff order/enquiry actions.
- Database tables: `public.orders`, `public.order_status_history`, and `public.enquiries`. All public-schema tables have RLS enabled; customers do not have direct table access.
- Customer tracking requires both an order reference and the email/phone verification value entered by staff when creating the order. Only customer-safe order fields and bilingual status history are returned.
- Never put a Supabase secret/service-role key in this repository or browser code. The website uses only the Supabase publishable key; privileged operations run inside the Edge Function.

### Staff onboarding (administrator action)

1. Create staff accounts in Supabase Authentication. Do not allow public self-registration for staff.
2. In the Supabase Dashboard, set the user's protected **app metadata** role to `staff` or `admin`. Do not use editable user metadata for authorization.
3. Give the staff member the dashboard URL: `/staff.html` (Indonesian) or `/en/staff.html` (English).
4. Staff create orders from the dashboard. The customer must enter the exact email address or phone value saved in the order's verification field to track it.
5. Test with a real low-value/internal order before sharing tracking with customers.

The database migration and Edge Function are deployed directly to the Supabase project. Never commit credentials or export customer records into the static GitHub Pages repository.
