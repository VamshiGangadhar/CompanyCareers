import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useCompanyStore from "../context/companyStore";
import Layout from "../components/Layout";

const CompanyPreview = () => {
  const { slug } = useParams();
  const { company, fetchCompany, loading } = useCompanyStore();

  useEffect(() => {
    if (slug) {
      fetchCompany(slug);
    }
  }, [slug, fetchCompany]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Company Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The company you're looking for doesn't exist.
          </p>
          <Link to="/login" className="text-primary-600 hover:text-primary-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const renderSection = (section) => {
    if (!section.visible) return null;

    const sectionId = section.id;
    const content = section.content;

    switch (section.type) {
      case "hero":
        return (
          <section key={sectionId} className="text-center py-20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {section.title}
            </h1>
            {content.subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </section>
        );

      case "about":
        return (
          <section key={sectionId} className="py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {section.title}
              </h2>
              <div className="prose prose-lg mx-auto text-gray-600">
                <p>{content.content}</p>
              </div>
            </div>
          </section>
        );

      case "values":
        return (
          <section key={sectionId} className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.items?.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {value}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "benefits":
        return (
          <section key={sectionId} className="py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.items?.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "team":
        return (
          <section key={sectionId} className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {section.title}
              </h2>
              {content.description && (
                <p className="text-lg text-gray-600 mb-8">
                  {content.description}
                </p>
              )}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <p className="text-gray-500">
                  Team member profiles would be displayed here
                </p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <Layout branding={company.branding}>
      {/* Preview Header */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Preview Mode</strong> - You are viewing how your careers
                page will look to visitors.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/company/${slug}/edit`}
              className="text-sm bg-white border border-yellow-300 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-50"
            >
              Back to Editor
            </Link>
            <Link
              to={`/${slug}/careers`}
              target="_blank"
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              View Live Page
            </Link>
          </div>
        </div>
      </div>

      {/* Company Sections */}
      <div>
        {company.sections && company.sections.length > 0 ? (
          company.sections.map(renderSection)
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to {company.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start building your careers page by adding sections in the editor.
            </p>
            <Link
              to={`/company/${slug}/edit`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Go to Editor
            </Link>
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Open Positions
          </h2>
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">💼</div>
            <p>Job listings would appear here</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompanyPreview;
