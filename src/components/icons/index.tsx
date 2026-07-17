import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M3 11.99v2.51c0 3.3 0 4.95 1.025 5.975S6.7 21.5 10 21.5h4c3.3 0 4.95 0 5.975-1.025S21 17.8 21 14.5v-2.51c0-1.682 0-2.522-.356-3.25s-1.02-1.244-2.346-2.276l-2-1.555C14.233 3.303 13.2 2.5 12 2.5s-2.233.803-4.298 2.409l-2 1.555C4.375 7.496 3.712 8.012 3.356 8.74S3 10.308 3 11.99"/><path d="M15 17c-.8.622-1.85 1-3 1s-2.2-.378-3-1"/></g></svg>
);

export const POSIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 20.25a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m8.5 0a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0M2 3h.207c1.324 0 1.987 0 2.419.402s.479 1.063.573 2.384l.251 3.519c.142 1.989.213 2.983.515 3.791a6 6 0 0 0 3.931 3.661c.828.243 1.83.243 3.836.243c2.105 0 3.18-.006 4.033-.265a6 6 0 0 0 4-4c.143-.472.207-1.004.235-1.741M13.5 6h-8m16.5.5S20.159 9 19.5 9S17 6.5 17 6.5M19.5 8V3"/></svg>
);

export const ShoppingCartIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.75 3h1.386c.835 0 1.545.61 1.672 1.435l.34 2.214m0 0L7.4 14.06a1.69 1.69 0 0 0 1.674 1.44h8.475a1.69 1.69 0 0 0 1.669-1.412l.985-5.914A.845.845 0 0 0 19.37 7.15H6.148m0 0l-.35-2.5"/><circle cx="9.5" cy="20" r="1.25" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none"/></svg>
);

export const ProductsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M13.5 20H9.583c-2.428 0-3.642 0-4.48-.71c-.84-.712-1.04-1.91-1.439-4.304L2.5 8h19l-.583 3.5M12 12v4m-4-4v4m14.5-8h-21M18 8l-3-5M6 8l3-5"/><path d="M22 17s-2.21-3-3-3s-3 3-3 3m3-2.5V21"/></g></svg>
);

export const InvoiceIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={className}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.762 42.335h21.215c5.812 0 10.523-4.712 10.523-10.523V5.665H21.292a5.26 5.26 0 0 0-5.262 5.262l-.007 5.1"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.762 16.027h5.261v21.046a5.264 5.264 0 0 1-5.261 5.262h0A5.264 5.264 0 0 1 5.5 37.073V21.288a5.264 5.264 0 0 1 5.262-5.261M5.5 25.391h10.523m6.414 0h13.361m-13.361 6.786h13.361M22.437 13.315h5.838v5.838h-5.838z"/></svg>
);

export const CategoriesIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="m8.637 8.994l2.667-4.402q.13-.211.308-.295q.177-.084.388-.084t.389.084t.307.295l2.668 4.402q.13.202.13.424t-.105.409t-.285.295t-.417.109H9.314q-.239 0-.418-.109q-.179-.108-.284-.29t-.106-.404t.13-.434m8.869 12.237q-1.553 0-2.644-1.087t-1.092-2.64t1.087-2.644q1.087-1.09 2.64-1.09q1.552 0 2.644 1.086q1.09 1.087 1.09 2.64q0 1.552-1.086 2.644q-1.087 1.09-2.64 1.09M3.77 19.923v-4.85q0-.343.232-.573q.233-.23.576-.23h4.85q.344 0 .574.232q.23.233.23.577v4.85q0 .343-.233.573q-.232.23-.576.23h-4.85q-.343 0-.573-.233q-.23-.232-.23-.576"/></svg>
);

export const PricingIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={className}><circle cx="29.218" cy="29.218" r="13.282" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M25.115 34.294a3.96 3.96 0 0 0 3.32 1.494h1.993a3.32 3.32 0 0 0 0-6.641h-2.159a3.32 3.32 0 1 1 0-6.641h1.993A3.57 3.57 0 0 1 33.582 24m-4.317-3.32v16.602m-12.77-12.59a4.47 4.47 0 0 1-1.413-3.277v-4.317a4.464 4.464 0 0 1 4.483-4.482a4.67 4.67 0 0 1 3.487 1.66M13.09 17.43h5.645m-5.645 3.32h5.645"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M16.02 31.774a13.282 13.282 0 1 1 15.754-15.753"/></svg>
);

export const ClientsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={className}><path fill="currentColor" d="M34.515 13.046C40.07 15.244 44 20.663 44 27l-.01.51a14.9 14.9 0 0 1-1.733 6.51l1.672 5.736c.385 1.325-.843 2.555-2.169 2.17h-.002l-5.73-1.673A14.94 14.94 0 0 1 29 42l-.387-.005a14.96 14.96 0 0 1-10.831-5.04q.602.044 1.217.045c.78 0 1.548-.055 2.3-.156a12.44 12.44 0 0 0 7.378 2.652L29 39.5c2.28 0 4.414-.61 6.253-1.675c.295-.17.649-.213.976-.118l4.917 1.435l-1.434-4.92a1.25 1.25 0 0 1 .118-.976a12.4 12.4 0 0 0 1.663-5.82L41.5 27c0-4.474-2.352-8.397-5.886-10.605a17 17 0 0 0-1.099-3.35m-15.13-8.041C27.49 5.21 33.998 11.845 33.998 20l-.005.387c-.202 7.977-6.632 14.406-14.609 14.608l-.386.005c-2.538 0-4.931-.633-7.029-1.747l-5.73 1.673h-.002c-1.325.384-2.554-.845-2.169-2.17L5.74 27.02a14.9 14.9 0 0 1-1.733-6.51l-.01-.51c0-8.284 6.717-15 15-15zM18.998 7.5c-6.903 0-12.5 5.597-12.5 12.5l.007.426a12.4 12.4 0 0 0 1.663 5.82c.17.295.213.648.118.976l-1.435 4.92l4.917-1.435a1.26 1.26 0 0 1 .977.118a12.44 12.44 0 0 0 6.253 1.675l.322-.004c6.754-.171 12.178-5.7 12.178-12.496S26.074 7.675 19.32 7.504zM23.5 21a3 3 0 0 1 3 3c0 3-3 5.5-7.5 5.5S11.5 27 11.5 24a3 3 0 0 1 3-3zM19 11a4 4 0 1 1 0 8a4 4 0 0 1 0-8"/></svg>
);

export const InventoryIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 3C6.49 3 2 7.49 2 13v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.51-4.49-10-10-10m4 12H8v-2h8zm-8 4v-2h8v2zm12 0h-2v-6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6H4v-6c0-4.41 3.59-8 8-8s8 3.59 8 8z"/></svg>
);

export const SuppliersIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M5 17.972c-1.097-.054-1.78-.217-2.268-.704s-.65-1.171-.704-2.268M9 18h6m4-.028c1.097-.054 1.78-.217 2.268-.704C22 16.535 22 15.357 22 13v-2h-4.7c-.745 0-1.117 0-1.418-.098a2 2 0 0 1-1.284-1.284C14.5 9.317 14.5 8.945 14.5 8.2c0-1.117 0-1.675-.147-2.127a3 3 0 0 0-1.926-1.926C11.975 4 11.417 4 10.3 4H2m0 4h6m-6 3h4"/><path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6h1.821c1.456 0 2.183 0 2.775.354c.593.353.938.994 1.628 2.276L22 11"/></g></svg>
);

export const PurchaseOrdersIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 14 14" className={className}><path fill="currentColor" fillRule="evenodd" d="M6.375 5.191V.251C5.411.267 4.65.326 3.772.403a1.67 1.67 0 0 0-1.375 1.004c-.162.37-.346.743-.54 1.137l-.01.021c-.374.76-.784 1.59-1.055 2.495a1.6 1.6 0 0 0-.185.536l-.051.322C.41 6.825.25 7.82.25 8.842c0 1.021.16 2.017.306 2.922l.051.322c.119.75.74 1.323 1.5 1.38l.868.07c1.282.104 2.64.214 4.025.214s2.743-.11 4.024-.214l.87-.07a1.645 1.645 0 0 0 1.499-1.38l.051-.322c.146-.905.306-1.9.306-2.922s-.16-2.017-.306-2.923l-.051-.322a1.6 1.6 0 0 0-.19-.544c-.277-.856-.644-1.594-.98-2.27l-.008-.015a20 20 0 0 1-.615-1.313A1.69 1.69 0 0 0 10.2.402A35 35 0 0 0 7.625.25v4.941c1.112.026 2.201.114 3.279.201q.448.037.894.071a.395.395 0 0 1 .36.33l.052.322c.147.917.29 1.812.29 2.727s-.143 1.809-.29 2.726l-.052.323a.395.395 0 0 1-.36.33l-.894.07C9.625 12.395 8.33 12.5 7 12.5s-2.625-.105-3.904-.209q-.449-.037-.894-.07a.395.395 0 0 1-.36-.33l-.052-.323c-.147-.917-.29-1.811-.29-2.726s.143-1.81.29-2.727l.052-.323a.395.395 0 0 1 .36-.329l.894-.07c1.078-.088 2.167-.176 3.279-.202m1.533 5.31a.75.75 0 0 1 .75-.75h1.75a.75.75 0 1 1 0 1.5h-1.75a.75.75 0 0 1-.75-.75" clipRule="evenodd"/></svg>
);

export const BranchesIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M18 3H6.834a3 3 0 1 0 0 2H18a3 3 0 0 1 0 6h-3.168a3 3 0 0 0-5.639 0H6a5 5 0 0 0 0 10h6v3l4-4l-4-4v3H6a3 3 0 0 1 0-6h3.203a3 3 0 0 0 5.629 0H18a5 5 0 0 0 0-10M4 5a1 1 0 1 1 1-1a1 1 0 0 1-1 1m8 8a1 1 0 1 1 1-1a1 1 0 0 1-1 1"/><path fill="currentColor" d="M20 17a3 3 0 1 0 3 3a3 3 0 0 0-3-3m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1"/></svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="none" stroke="currentColor" strokeWidth="2" d="M12 9V0m3 12h9M0 12h9m3 12v-9m0 6a9 9 0 1 0 0-18a9 9 0 0 0 0 18ZM3.5 8.5L1 7.5m19.5 8l2.5 1M3 3l2.5 2.5M3 3l2.5 2.5M18 18l2.5 2.5m0-17.5L18 5.5M5.5 18L3 20.5m9-5.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm8.5-6.5l2.5-1m-7.5-4l1-2.5m-1 19.5l1 2.5m-8-2.5l-1 2.5m-4-7.5l-2.5 1m7.5-13L7.5 1"/></svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="currentColor"><path d="M3 8a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 8a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"/></g></svg>
);

export const AddProductIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" className={className}><path fill="currentColor" d="M9.072 16.59q.191.075.39.12q.25.565.614 1.057a3.5 3.5 0 0 1-1.376-.25l-5.757-2.302A1.5 1.5 0 0 1 2 13.822V6.176a1.5 1.5 0 0 1 .943-1.392L8.7 2.48a3.5 3.5 0 0 1 2.6 0l5.757 2.303c.57.227.943.779.943 1.392v4.08a5.5 5.5 0 0 0-1-.657V6.176a.5.5 0 0 0-.314-.464L10.929 3.41a2.5 2.5 0 0 0-1.857 0L3.314 5.712A.5.5 0 0 0 3 6.176v7.646a.5.5 0 0 0 .314.465zM5.703 6.042a.5.5 0 1 0-.406.914L9.5 8.824v3.381a5.5 5.5 0 0 1 1-1.48v-1.9l4.203-1.869a.5.5 0 1 0-.406-.914L10 7.952zM17 18.241a4.5 4.5 0 1 1-5-7.484a4.5 4.5 0 0 1 5 7.484m-2.146-6.095a.5.5 0 0 0-.854.353v1.5h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0v-1.5h1.5a.5.5 0 0 0 0-1H15v-1.5a.5.5 0 0 0-.146-.354"/></svg>
);

export const QuickSellIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" className={className}><path fill="currentColor" d="M9.93 4.138a1.25 1.25 0 0 1 1.14 0l2.25 1.155c.418.214.68.643.68 1.112v3.189c0 .469-.262.898-.68 1.112l-2.25 1.155a1.25 1.25 0 0 1-1.14 0l-2.25-1.155A1.25 1.25 0 0 1 7 9.594v-3.19c0-.468.262-.897.68-1.111zM8.552 6.775a.5.5 0 0 0 .223.671L10 8.058v1.441a.5.5 0 0 0 1 0V8.058l1.224-.612a.5.5 0 1 0-.448-.894L10.5 7.19l-1.276-.638a.5.5 0 0 0-.671.223M1.5 7.5a.5.5 0 0 0 0 1h3a.5.5 0 1 0 0-1zm.5-2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m.5 4.5a.5.5 0 0 0 0 1h3a.5.5 0 1 0 0-1z"/></svg>
);

export const StaffPermissionsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor"><circle cx="5.5" cy="7.5" r="1"/><path strokeLinecap="round" d="M8.5 6.5h11m-11 2h6"/><circle cx="5.5" cy="12" r="1"/><path strokeLinecap="round" d="M8.5 11h8m-8 2h7"/><circle cx="5.5" cy="16.5" r="1"/><path strokeLinecap="round" d="M8.5 15.5H18m-9.5 2h4"/></g></svg>
);

export const ShiftManagementIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M11.11 4.049a1 1 0 1 0-.22-1.988C5.888 2.614 2 6.852 2 12c0 5.523 4.477 10 10 10c5.146 0 9.383-3.887 9.939-8.885a1 1 0 0 0-1.988-.221A8.001 8.001 0 0 1 4 12a8 8 0 0 1 7.11-7.951m3.657-1.658a1 1 0 0 0-.54 1.925q.432.122.842.29a1 1 0 0 0 .757-1.852a10 10 0 0 0-1.059-.363m2.582 2.3a1 1 0 0 1 1.413-.06q.318.291.609.608a1 1 0 0 1-1.474 1.352a8 8 0 0 0-.486-.486a1 1 0 0 1-.062-1.413M11 6a1 1 0 0 1 1 1v5h3a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1m8.94 1.623a1 1 0 0 1 1.304.547a10 10 0 0 1 .365 1.063a1 1 0 1 1-1.925.54a8 8 0 0 0-.291-.846a1 1 0 0 1 .546-1.304"/></svg>
);

export const CashIcon: React.FC<IconProps> = ({ className, size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 14 14" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect width="10.5" height="8" x=".5" y="1.75" rx="1"/><circle cx="5.75" cy="5.75" r="1.5"/><path d="M3.5 12.25h9a1 1 0 0 0 1-1v-5"/></g></svg>
);

export const InstaPayIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path fill="none" d="m21.36 15.869l4.546 7.887l-9.278 8.322m-1.874-16.21l4.547 7.888l-9.278 8.322m21.099-14.913h8.13c2.81 0 4.669 1.96 4.166 4.397c-.504 2.436-3.173 4.397-5.984 4.397h-9.762l-1.896 6.173M9.383 16.016l-.936 3.087m-.995 3.287L4.5 32.132"/></svg>
);

export const WalletIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M6 19q-1.246 0-2.123-.877T3 16V8q0-1.246.877-2.123T6 5h12q1.246 0 2.123.877T21 8v8q0 1.246-.877 2.123T18 19zM6 8.5h12q.589 0 1.098.202t.902.592V8q0-.825-.587-1.412T18 6H6q-.825 0-1.412.588T4 8v1.294q.392-.39.902-.592T6 8.5m-1.966 2.73l11.337 2.759q.187.05.383.009q.196-.04.338-.171l3.725-3.15q-.217-.529-.71-.853T18 9.5H6q-.766 0-1.32.491q-.555.492-.645 1.24"/></svg>
);

export const CardIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"><path d="M10 4C6.229 4 4.343 4 3.172 5.172S2 8.229 2 12s0 5.657 1.172 6.828S6.229 20 10 20h1.5M14 4c3.771 0 5.657 0 6.828 1.172C21.892 6.235 21.99 7.886 22 11"/><path strokeLinejoin="round" d="M15.5 14v6m0 0l2-2m-2 2l-2-2m6.5 2v-6m0 0l2 2m-2-2l-2 2"/><path d="M10 16H6m-4-6h5m15 0H11"/></g></svg>
);

export const StoreIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10.987v4.506c0 2.833 0 4.249.879 5.129c.878.88 2.293.88 5.121.88h6c2.828 0 4.243 0 5.121-.88c.88-.88.88-2.296.88-5.129v-4.506"/><path strokeLinecap="round" d="M7 17.974h4"/><path strokeLinecap="round" strokeLinejoin="round" d="M17.796 2.5L6.15 2.53c-1.738-.09-2.184 1.249-2.184 1.903c0 .585-.075 1.438-1.14 3.042c-1.066 1.603-.986 2.08-.385 3.19c.498.92 1.766 1.28 2.428 1.341c2.1.048 3.122-1.766 3.122-3.041c1.042 3.203 4.005 3.203 5.325 2.837c1.323-.367 2.456-1.68 2.723-2.837c.156 1.437.63 2.276 2.027 2.852c1.449.597 2.694-.315 3.319-.9s1.026-1.883-.088-3.31c-.768-.984-1.088-1.912-1.194-2.872c-.06-.557-.114-1.155-.506-1.536c-.572-.556-1.393-.725-1.801-.699"/></g></svg>
);

export const InvoiceSettingsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 18.646V8.054c0-2.854 0-4.28.879-5.167C5.757 2 7.172 2 10 2h4c2.828 0 4.243 0 5.121.887C20 3.773 20 5.2 20 8.054v10.592c0 1.511 0 2.267-.462 2.565c-.755.486-1.922-.534-2.509-.904c-.485-.306-.727-.458-.997-.467c-.29-.01-.537.137-1.061.467l-1.911 1.205c-.516.325-.773.488-1.06.488s-.544-.163-1.06-.488l-1.91-1.205c-.486-.306-.728-.458-.997-.467c-.291-.01-.538.137-1.062.467c-.587.37-1.754 1.39-2.51.904C4 20.913 4 20.158 4 18.646M11 11H8m6-4H8"/></svg>
);

export const StaffIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 2048 2048" className={className}><path fill="currentColor" d="M1250 1333q68 34 123 85t93 118h-157q-54-61-128-94t-157-34q-80 0-149 30t-122 82t-83 123t-30 149H512q0-73 20-141t57-129t91-108t118-81q-75-54-116-135t-42-174q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100H0q0-52 14-102t39-93t63-80t83-61q-34-35-52-81t-19-95q0-53 20-99t55-82t81-55t100-20q53 0 99 20t82 55t55 81t20 100q0 49-18 95t-53 81q42 23 75 55t60 70q27-40 62-72t76-54t87-35t95-12q48 0 94 12t87 34t77 55t62 72q26-38 59-70t76-55q-34-35-52-81t-19-95q0-53 20-99t55-82t81-55t100-20q53 0 99 20t82 55t55 81t20 100q0 49-18 95t-53 81q46 25 83 61t62 79t40 94t14 102h-128q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100q0 92-41 173t-117 136m414-949q-27 0-50 10t-40 27t-28 41t-10 50q0 27 10 50t27 40t41 28t50 10q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10M384 640q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10q-27 0-50 10t-40 27t-28 41t-10 50q0 27 10 50t27 40t41 28t50 10m640 640q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100q0 53 20 99t55 82t81 55t100 20m768 384h256v128h-256v256h-128v-256h-256v-128h256v-256h128z"/></svg>
);

export const PaymentMethodsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M16.79 23c-.42-.17-.72-.55-.79-1c-.05-.26 0-.44.4-1.16c1.5-2.7 2.27-5.75 2.23-8.84c.04-3-.69-5.93-2.13-8.56c-.21-.44-.4-.86-.56-1.31c.06-.38.25-.73.56-.94c.45-.24 1-.19 1.41.09c.28.36.52.72.72 1.14A21.4 21.4 0 0 1 20.8 9c.23 1.81.26 3.65.09 5.47c-.31 2.34-1 4.6-2.06 6.71c-.64 1.28-1 1.82-1.38 1.82zm-4.36-2.21c-.57-.16-.93-.74-.81-1.32c0-.12.31-.67.59-1.23c1.18-2.27 1.69-4.83 1.46-7.38c-.14-1.83-.67-3.61-1.54-5.22c-.63-1.26-.67-1.46-.3-2c.44-.49 1.17-.56 1.71-.14c.72 1.06 1.29 2.22 1.71 3.44c1.28 3.79 1.08 7.92-.56 11.56c-.84 1.89-1.43 2.5-2.26 2.24zm-4.5-2.23a1.31 1.31 0 0 1-.73-.86c0-.2 0-.46.45-1.26a8.99 8.99 0 0 0 0-8.68C7 6.5 7 6.24 7.53 5.76c.19-.22.47-.33.77-.29c.64 0 1 .31 1.54 1.44A10.5 10.5 0 0 1 11.12 12c.04 1.81-.4 3.61-1.27 5.2c-.54 1.05-.81 1.3-1.35 1.39c-.19.02-.39 0-.57-.09zm-4.21-2.13c-.33-.16-.59-.43-.72-.78c-.1-.35 0-.65.4-1.29c.5-.68.74-1.52.69-2.36c.07-.85-.16-1.69-.65-2.39A6 6 0 0 1 3 8.82c-.11-.63.31-1.23 1-1.35c.54-.1.92.13 1.42.89a6.62 6.62 0 0 1 0 7.27c-.51.77-1.09 1-1.69.8z"/></svg>
);

export const NotificationIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M9.107 2.674A6.5 6.5 0 0 1 12 2c3.727 0 6.75 3.136 6.75 7.005v.705a4.4 4.4 0 0 0 .692 2.375l1.108 1.724c1.011 1.575.239 3.716-1.52 4.214a25.8 25.8 0 0 1-14.06 0c-1.759-.498-2.531-2.639-1.52-4.213l1.108-1.725A4.4 4.4 0 0 0 5.25 9.71v-.705c0-1.074.233-2.092.65-3.002M7.5 19c.655 1.748 2.422 3 4.5 3q.367 0 .72-.05M16.5 19a4.5 4.5 0 0 1-1.302 1.84"/></svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5l2 2l5-5"/></g></svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export const MinusIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/></svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

export const TrendingDownIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
);

export const PackageIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

export const DollarSignIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export const BarcodeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
);

export const ReceiptIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12h-6"/><path d="M16 16h-6"/></svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

export const XIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"/></svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

export const TransferIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m17 3 4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="m7 21-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
