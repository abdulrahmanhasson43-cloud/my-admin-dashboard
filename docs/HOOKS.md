# الخطافات المخصصة (Custom Hooks)

يحتوي مشروع فونو على **4 خطافات مخصصة** في `src/hooks/`. هذه الخطافات تغلف منطقًا شائع الاستخدام وتُسهّل إعادة الاستخدام عبر الصفحات.

---

## 1. useIsMobile

**الملف:** `src/hooks/use-mobile.ts`
**التوقيع:** `useIsMobile(): boolean`

**الغرض:** يُرجع `true` إذا كان عرض النافذة أقل من 768 بكسل (نقطة التوقف `md` في Tailwind). يُستخدم لتبديل التخطيط بين الجوال والحاسوب.

**التنفيذ:** يستخدم `matchMedia` للاستماع لتغيير نقطة الت_BREAKPOINT بدلًا من حدث `resize` الخام (الذي يطلق عشرات المرات في الثانية على Chrome الجوال أثناء تمرير شريط العنوان). يبدأ بقيمة مُهيّأة كسولًا عبر `getIsMobile()` لتفادي render إضافي.

---

## 2. useDeviceType

**الملف:** `src/hooks/useDeviceType.ts`
**التوقيع:** `useDeviceType(): 'mobile' | 'tablet' | 'desktop'`

**الغرض:** يُرجع نوع الجهاز بناءً على عرض النافذة:
- `mobile`: أقل من 768px
- `tablet`: 768px إلى أقل من 1024px
- `desktop`: 1024px فأكثر

يُستخدم لتفعيل اختصارات لوحة المفاتيح على الحاسوب فقط (عبر `KeyboardShortcutActivator` في `App.tsx`) ولتعديل سلوك التخطيط.

**التنفيذ:** يستخدم `matchMedia` لنقطتي التوقف 768px و1024px. نفس المبدأ كما في `useIsMobile` — الاستماع لعبور نقطة الت_BREAKPOINT وليس لكل بكسل في `resize`.

---

## 3. useCommandPalette

**الملف:** `src/hooks/useCommandPalette.ts`
**التوقيع:** `useCommandPalette(): { open: boolean; setOpen: (v: boolean) => void }`

**الغرض:** يتحكم في فتح/إغلاق لوحة الأوامر (Command Palette). يستمع لـ:
- `Ctrl+K` / `Cmd+K` — تبديل الفتح/الإغلاق
- `Esc` — إغلاق اللوحة إذا كانت مفتوحة

**التنفيذ:** يحتفظ بحالة `open` في `useState` محلية (ليست في Context لأن اللوحة لها حالة واحدة عابرة). يُستهلك في `CommandPaletteOverlay` في `App.tsx` الذي يمرّر `open` و`setOpen` لمكوّن `CommandPalette`.

> هذا الخطاف هو الفكرة #1 من ملف الأفكار (لوحة الأوامر).

---

## 4. useKeyboardShortcuts

**الملف:** `src/hooks/useKeyboardShortcuts.ts`
**التوقيع:** `useKeyboardShortcuts(enabled: boolean): void`

**الغرض:** يفعّل اختصارات لوحة المفاتيح للمستخدمين المتقدمين على الحاسوب. المعامل `enabled` يتحكم في التفعيل (يُمرّر `false` على الأجهزة اللمسية).

**الاختصارات المدعومة:**

| الاختصار | الإجراء |
|----------|--------|
| `Alt+S` | فتح نقطة البيع (POS) |
| `Alt+P` | الانتقال للمنتجات |
| `Alt+I` | الانتقال للفواتير |
| `Alt+R` | الانتقال للتقارير |
| `Alt+,` | فتح الإعدادات |
| `g` ثم `d` | لوحة المعلومات (chord بأسلوب vim) |
| `g` ثم `p` | المنتجات |
| `g` ثم `i` | الفواتير |
| `g` ثم `s` | نقطة البيع |
| `/` | تركيز شريط البحث (عند عدم الكتابة في حقل) |
| `Esc` | إزالة التركيز / إغلاق العناصر المتراكبة |

> الاختصارات الفردية (`g`, `/`) تعمل فقط عندما لا يكون المستخدم يكتب في حقل إدخال.

---

## useServiceState

`hooks/useServiceState.ts` — حالة React لقيمة قواعدها في service. بترجّع `[state, update]`. `update(compute)` بتحسب القيمة التالية من **آخر** قيمة (محفوظة في ref، فاستدعاءين في نفس اللحظة بيشوفوا بعض)، وبتخزنها وبترجعها. هوية الدالة ثابتة فمأمونة في dependency arrays. الهدف: ما يبقاش فيه side effects (حفظ، إشعار) جوه `setState(prev => …)`، لأن React ممكن يشغّل الـ updater مرتين.

## usePosCatalog / usePosPayment

حالة شاشة الكاشير مفصولة في خطافين صغيرين (`hooks/usePosCatalog.ts`, `hooks/usePosPayment.ts`):

- `usePosCatalog(products)` — نص البحث، الفئة المختارة، قائمة الفئات (بدون تكرار)، والمنتجات المطابقة (البحث بالاسم أو الباركود).
- `usePosPayment(enabledMethods, total)` — الطريقة المختارة `selectedPayment` والطريقة الفعلية `effectivePayment` (لو التاجر قفل الطريقة من الإعدادات بترجع لأول طريقة مفعّلة، ولو اتفتحت تاني بترجع للمختارة)، والمبلغ المدفوع والباقي.

### hooks الكاشير التانية

شاشة الكاشير بقت تجميع (271 سطر بدل 805)، والحالة والمنطق في hooks صغيرة (`hooks/usePos*.ts`):

- `usePosCart()` — أسطر السلة وإجراء واحد لكل قاعدة في `lib/cart.ts` (`add`, `addVariant`, `changeQty`, `setQty`, `remove`, `clear`, `replace`) + `itemCount` و`quantityFor`.
- `usePosDialogs()` — أعلام فتح/غلق النوافذ فقط (السلة، الماسح، الطلبات المعلقة، نافذة التعليق، اختيار العميل، متغيرات المنتج). نافذة المتغيرات "مفتوحة" لما يبقى فيها منتج، فمستحيل العلم والمنتج يختلفوا.
- `usePosCheckout({...})` — إتمام البيع المحمي من الضغط المزدوج، والدفع السريع، والدفع بمبلغ مكتوب (`evaluateTender` من `services/sale`)، وعلامة النجاح والفاتورة. مؤقّت علامة النجاح بيتلغي لو الشاشة اتقفلت.
- `usePosHeldOrders({...})` — تعليق السلة الحالية واسترداد طلب معلق.
- `usePosShortcuts(actions)` — بيسمع لحدث `vuno:pos-shortcut`. المستمع بيتسجّل **مرة واحدة** وبينادي أحدث `actions` عن طريق ref (قبل كده كان بيتشال ويتحط من جديد مع كل ريندر). `routePosShortcut` دالة نقية مختبرة.

**ملاحظة مهمة:** `selectedPayment` بيتحدّث في الريندر الجاي، فاللي بيتم في نفس الضغطة (زي الدفع السريع) لازم يمرّر الطريقة كمعامل (`checkout('cash')`) ما يقراش `effectivePayment`.

## useCompleteSale

`hooks/useCompleteSale.ts` — بيوصّل `useProducts` و`useShift` و`useSalesGoal` و`useActivityLog` بـ use case `completeSale` (`services/sale`). بيرجّع دالة `(input) => Promise<CompletedSale | null>`.

## useInvoiceBuilder

`hooks/useInvoiceBuilder.ts` — حالة لوحة "فاتورة جديدة": العميل والسطور والبحث والخصم وطريقة الدفع، والإجماليات (من `lib/invoiceBuilder.ts`)، والحفظ. بياخد `products` و`clients` و`createInvoice` و`onSaved` كمعاملات. بيرفض الحفظ من غير عميل أو من غير منتجات برسالة. بيبعت مع الفاتورة أسطرها (`lines`) عشان المرتجع بعدين يعرف المنتجات الحقيقية.

## useBranchForm / useStaffForm

`hooks/useBranchForm.ts` و`hooks/useStaffForm.ts` — نموذج إضافة/تعديل الفرع ونموذج الموظف (فتح/غلق، الحقول، الدور، شبكة الصلاحيات، الحفظ). تغيير الدور بيرجّع شبكة الصلاحيات لافتراضيات الدور. الاسم الفاضي بيتتجاهل. `useStaffForm` بياخد `createStaff` و`updateStaff` كمعاملات (مش بينادي `useStaff()` بنفسه، لأن كل نداء لـ`useStaff` له حالته الخاصة).

## useLoginForm

`hooks/useLoginForm.ts` — كل حالة شاشة تسجيل الدخول (الوضع، الحقول، التحميل) و`submit` والعنوان، مشتركة بين تصميم الموبايل والديسكتوب. التحقق من الهوية لسه محاكاة (TODO مرحلة 3): بعد التأخير الصناعي بينادي `useAuth().signIn()` عشان تتسجل الجلسة، وبعدين يروح `/dashboard`.

## useSignOut

`hooks/useSignOut.ts` — بيرجّع دالة بتنهي الجلسة (`useAuth().signOut()`) وتودّي لـ`/login`. مستخدمة في زرار الخروج بالقايمة الجانبية (`AppLayout`) وفي `ProfilePage`. **أي زرار خروج جديد لازم يستخدمها**: قبلها كان واحد بس بيعمل `navigate('/login')` وواحد بيعرض رسالة، ومفيش حاجة بتنهي أي جلسة.

## useInventoryFilters / useStockTransfers

- `hooks/useInventoryFilters.ts` — `useInventoryFilters(products)`: نص البحث والفئة المختارة وشرائح الفئات والمنتجات المطابقة (قواعدها في `lib/inventory.ts`).
- `hooks/useStockTransfers.ts` — `useStockTransfers(needsConfirmation)`: النافذة المفتوحة والكمية المكتوبة والمنتج المسحوب، و`openTransfer` و`closeTransfer` و`submitTransfer` و`quickTransfer` و`dropToStore`. القرار (ننقل / نطلب تأكيد / نرفض) من `planQuickTransfer` و`planModalTransfer`، والهوك بينفّذه ويظهر الرسائل. فتح النافذة بيفضّي الكمية دايمًا.

## useReturnForm

`hooks/useReturnForm.ts` — `useReturnForm(type)`: حالة نموذج "مرتجع جديد" (الاسم والهاتف والفاتورة والسبب والملاحظة والمنتجات المعلّم عليها والكميات)، والمنتجات المعروضة (`available` من `returnableItems`)، ومبلغ الاسترداد للمعاينة (`calcSubtotal`)، و`buildInput()` اللي بيرجّع مدخلات الخدمة أو `null` لو النموذج مش جاهز (`canSubmitReturn`). الفاتورة الأولى هي المختارة طول ما المستخدم ما اختارش، وتغيير الفاتورة بيمسح العلامات والكميات. القواعد كلها في `lib/returns.ts`.

## useOrdersBoard / useNewOrderForm

- `hooks/useOrdersBoard.ts` — `useOrdersBoard()`: حالة شاشة الطلبات. بياخد الطلبات من `useOrders` (يعني من `OrderService`)، وبيحتفظ بفلتر الوقت وفلتر الحالة (الموبايل) والبطاقة اللي بتتسحب، وبيرجّع المحسوب منهم: `columns` (عمود لكل حالة للديسكتوب) و`listOrders` (قايمة الموبايل) و`summary` (أرقام الإحصائيات). `dropOn(status)` بتنقل البطاقة المسحوبة: بترجّع `true` لو اتنقلت و`false` لو مفيش بطاقة مسحوبة، وبترفض لو النقل فشل (الرسايل في الصفحة). "دلوقتي" للفلتر الزمني بتتثبّت مرة واحدة عند فتح الصفحة (قاعدة React Compiler). القواعد كلها في `lib/orders.ts`.
- `hooks/useNewOrderForm.ts` — `useNewOrderForm()`: حالة نموذج "طلب جديد" (الاسم والهاتف وطريقة الدفع والأسطر والخانات التلاتة للسطر الجاري كتابته)، و`addItem` (بتتجاهل السطر الناقص، وبتدّيه رقم `generateId('p')`)، و`total` للمعاينة، و`buildInput()` اللي بيرجّع مدخلات الخدمة أو `null` لو النموذج مش جاهز (`canSubmitOrder`).

## useDraft / useSavedNotice

- `hooks/useDraft.ts` — `useDraft(initial)`: قيم نموذج بيتعدّل، ودالة واحدة `setField(key, value)` لأي حقل. بتتحط في **الصفحة** مش في النموذج، علشان اللي اتكتب يفضل بعد الخروج من القسم والرجوع له (نموذجا المتجر والفاتورة في `SettingsPage`).
- `hooks/useSavedNotice.ts` — `useSavedNotice()`: رسالة "تم الحفظ بنجاح". بترجّع `{ visible, show }`؛ `show()` بتظهرها وبتختفي بعد `SAVED_NOTICE_MS` (ثانيتين). الحفظ مرة تانية والرسالة ظاهرة بيبدأ الثانيتين من الأول، والخروج من الشاشة بيلغي الميعاد المعلّق.

## useReturns

`hooks/useReturns.ts` — `advanceReturnStatus` بيعدّي من use case `processReturn` (`services/return`): الخطوة الأخيرة (`refunded`) بترجّع البضاعة للمتجر (مرتجع عميل) أو بتخصمها (مرتجع مورد) وبتكتب في سجل الأنشطة. لو الحالة اتغيّرت والمخزون ما اتحدّثش، بيظهر تنبيه في `error` ("تعذّر تحديث المخزون" أو "بعض المنتجات غير موجودة في المخزون") والقايمة بتفضل بالحالة الجديدة.

## إضافة خطاف جديد

عند إضافة خطاف مخصص:

1. أنشئ ملف `src/hooks/useXxx.ts`.
2. صدّر دالة باسم `useXxx` تبدأ بـ `use` (مطلوب لقاعدة lint للخطافات).
3. أضف توثيق JSDoc فوق الدالة يشرح الغرض والمعاملات والقيمة المُرجعة.
4. إذا كان الخطاف يستمع لأحداث عامة (`window.addEventListener`)، تأكد من تنظيف المستمع في `useEffect` cleanup.
5. أضف هذا الخطاف إلى هذا الملف (`docs/HOOKS.md`).
