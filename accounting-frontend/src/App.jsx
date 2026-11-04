import React from "react";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";
import { Categories } from "./components/Categories";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AddCategory } from "./components/AddCategory";
import { Products } from "./components/Products";
import { AddProduct } from "./components/AddProduct";
import { EditProduct } from "./components/EditProduct";
import { EditCategory } from "./components/EditCategory";
import { Expenses } from "./components/Expense";
import { AddExpense } from "./components/AddExpense";
import { EditExpense } from "./components/EditExpense";
import Customers from "./components/Customers";
import { AddCustomers } from "./components/AddCustomers";
import { EditCustomers } from "./components/EditCustomers";
import { Invoices } from "./components/Invoices";
import { AddInvoice } from "./components/AddInvoice";
import { ViewInvoice } from "./components/ViewInvoice";
import { EditInvoice } from "./components/EditInvoice";
import Dashboard from "./components/Dashboard";
import ViewCustomer from "./components/ViewCustomer";
import Suppliers from "./components/Suppliers";
import AddSupplier from "./components/AddSupplier";
import Purchases from "./components/Purchases";
import ViewPurchase from "./components/ViewPurchase";
import AddPurchase from "./components/AddPurchase";
import EditPurchase from "./components/EditPurchase";
import { ViewProduct } from "./components/ViewProduct";
import { ViewCategory } from "./components/ViewCategory";
import { ViewExpense } from "./components/ViewExpense";
import { SalesReturns } from "./components/SalesReturns";
import AddSalesReturn from "./components/AddSalesReturn";
import ViewSalesReturn from "./components/ViewSalesReturn";
import EditSalesReturn from "./components/EditSalesReturn";
import PurchaseReturns from "./components/PurchaseReturns";
import AddPurchaseReturn from "./components/AddPurchaseReturn";

function App() {
   return (
    <BrowserRouter>
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div  style={{ flex: 1, minWidth: 0 ,marginLeft:"250px"}}>
        <Routes>
            <Route path='/' element={<Dashboard />}/>
            <Route path='/categories' element={<Categories />}/>     
            <Route path='/categories/add' element={<AddCategory />}/>
            <Route path='/categories/edit/:id' element={<EditCategory />}/>
            <Route path="/categories/view/:id" element={<ViewCategory />}/>

            <Route path='/products' element={<Products />} />
            <Route path='/products/add' element={<AddProduct />}/>
            <Route path="/products/view/:id" element={<ViewProduct />}/>
            <Route path='/products/edit/:id' element={<EditProduct />}/>

            <Route path='/customers' element={<Customers />} />
            <Route path='/customers/add' element={<AddCustomers />}/>
            <Route path='/customers/edit/:id' element={<EditCustomers />}/>
            <Route path='/customers/view/:id' element={<ViewCustomer />} />

            <Route path='/suppliers' element={<Suppliers />} />
            <Route path="/suppliers/add" element={<AddSupplier />} />

            <Route path='/expenses' element={<Expenses />} />
            <Route path='/expenses/add' element={<AddExpense />} />
            <Route path='/expenses/edit/:id' element={<EditExpense />}/>
            <Route path='/expenses/view/:id' element={<ViewExpense />}/>

            <Route path='/invoices' element={<Invoices />} />
            <Route path='/invoices/add' element={<AddInvoice />} />
            <Route path='/invoices/view/:id' element={<ViewInvoice />} />
            <Route path='/invoices/edit/:id' element={<EditInvoice />} />

            <Route path='/purchases' element={<Purchases />}/>
            <Route path='/purchases/add' element={<AddPurchase />} />
            <Route path= '/purchases/view/:id' element={<ViewPurchase />} />
            <Route path='/purchases/edit/:id' element={<EditPurchase />} />

            <Route path='/sales-returns' element={<SalesReturns />} />
            <Route path='/sales-returns/add' element={<AddSalesReturn />} />
            <Route path='/sales-returns/view/:id' element={<ViewSalesReturn />} />
            <Route path="/sales-returns/edit/:id" element={<EditSalesReturn />} />

            <Route path="/purchase-returns" element={<PurchaseReturns />} />
            <Route path="/purchase-returns/add" element={<AddPurchaseReturn />} />
        </Routes>
      </div>
    </div></BrowserRouter>
  );
}

export default App;