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
            <Route path='/products' element={<Products />} />
            <Route path='/products/add' element={<AddProduct />}/>
            <Route path='/products/edit/:id' element={<EditProduct />}/>
            <Route path='/categories/edit/:id' element={<EditCategory />}/>
            <Route path="/expenses" element={<Expenses />} />
            <Route path='/customers' element={<Customers />} />
            <Route path='/customers/add' element={<AddCustomers />}/>
            <Route path='/customers/edit/:id' element={<EditCustomers />}/>
            <Route path='/customers/view/:id' element={<ViewCustomer />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/add" element={<AddSupplier />} />
            <Route path="/purchases" element={<Purchases />} />

            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/edit/:id" element={<EditExpense />}/>
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/add" element={<AddInvoice />} />
            <Route path="/invoices/view/:id" element={<ViewInvoice />} />
            <Route path="/invoices/edit/:id" element={<EditInvoice />} />
            <Route path="/purchases" element={<Purchases />}/>

        </Routes>
      </div>
    </div></BrowserRouter>
  );
}

export default App;