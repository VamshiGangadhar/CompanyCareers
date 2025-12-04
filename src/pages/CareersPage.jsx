import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useCompanyStore from "../context/companyStore";
import Layout from "../components/Layout";
import JobList from "../components/JobList";

const CareersPage = () => {
  const { slug } = useParams();
  const { company, jobs, fetchCompany, fetchJobs, loading } = useCompanyStore();
  const [jobFilters, setJobFilters] = useState({});

  useEffect(() => {
    if (slug) {
      fetchCompany(slug);
      fetchJobs(slug);
    }
  }, [slug, fetchCompany, fetchJobs]);

  const handleFiltersChange = (newFilters) => {
    setJobFilters(newFilters);
    fetchJobs(slug, newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading careers page...</p>
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
          <p className="text-gray-600">
            The careers page you're looking for doesn't exist.
          </p>
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {section.title}
            </h1>
            {content.subtitle && (
              <p className="text-xl max-w-3xl mx-auto">{content.subtitle}</p>
            )}
          </section>
        );

      case "about":
        return (
          <section key={sectionId} className="py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {section.title}
              </h2>
              <div className="prose prose-lg mx-auto">
                <p>{content.content}</p>
              </div>
            </div>
          </section>
        );

      case "values":
        return (
          <section key={sectionId} className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.items?.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold">{value}</h3>
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
              <h2 className="text-3xl font-bold mb-12 text-center">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.items?.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>{benefit}</span>
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
              <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
              {content.description && (
                <p className="text-lg mb-8">{content.description}</p>
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
      {/* SEO Meta Tags would be added here */}
      <title>{company.name} - Careers</title>

      {/* Company Sections */}
      <div>
        {company.sections && company.sections.length > 0 ? (
          company.sections.map(renderSection)
        ) : (
          <section className="text-center py-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join {company.name}
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover exciting career opportunities with our team
            </p>
          </section>
        )}
      </div>

      {/* Jobs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Open Positions
          </h2>

          <JobList
            jobs={jobs}
            filters={jobFilters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">{company.name}</h3>
          <p className="text-gray-400 mb-6">
            Thank you for your interest in joining our team
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default CareersPage;
