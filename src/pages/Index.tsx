import React from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import { useProjects } from "@/context/ProjectsContext";

const Index = () => {
  const { 
    projects, 
    invoices, 
    loading, 
    createInvoice, 
    createThirdPartyInvoice,
    updateInvoiceStatus,
    refreshData
  } = useProjects();

  return (
    <Layout>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin" />
        </div>
      ) : (
        <Dashboard
          projects={projects}
          invoices={invoices}
          onCreateInvoice={createInvoice}
          onCreateThirdPartyInvoice={createThirdPartyInvoice}
          onUpdateInvoiceStatus={updateInvoiceStatus}
          onRefreshData={refreshData}
        />
      )}
    </Layout>
  );
};

export default Index;
