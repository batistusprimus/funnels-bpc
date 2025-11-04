'use client';

/**
 * Page de documentation API Swagger
 */

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Documentation API v1</h1>
        <p className="text-muted-foreground">
          API REST pour BPC Funnels - Gestion des leads et webhooks
        </p>
      </div>
      
      <div className="bg-background rounded-lg border">
        <SwaggerUI 
          url="/api/v1/docs"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          displayRequestDuration={true}
        />
      </div>
    </div>
  );
}

