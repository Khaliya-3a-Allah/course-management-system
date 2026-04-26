import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../utils/api";
import { AlertIcon, CheckIcon, InfoIcon, PrinterIcon, LinkedInIcon } from "../components/Icons";

function VerifyCertificate() {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/certificates/verify/${certId}`);
        setAvailability(response.available === false ? "not_available" : "available");

        if (response.valid) {
          setCertificate(response.certificate);
          // Generate QR code URL
          const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            window.location.href
          )}`;
          setQrUrl(qr);
        } else {
          setError(response.message || "Certificate verification failed");
        }
      } catch (err) {
        setAvailability("not_available");
        setError(err.message || "Failed to verify certificate");
      } finally {
        setLoading(false);
      }
    };

    verifyCert();
  }, [certId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-base text-[#e8e6e0] px-6 md:px-8 py-10 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-[rgba(255,255,255,0.1)] rounded mb-4"></div>
            <div className="h-6 bg-[rgba(255,255,255,0.1)] rounded w-3/4 mx-auto mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded"></div>
              <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base text-[#e8e6e0] px-6 md:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        {error ? (
          // Error State
          <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-surface p-8 text-center">
            <div className="text-4xl mb-4 flex justify-center text-amber-400"><AlertIcon size={40} /></div>
            <p className="text-[0.85rem] uppercase tracking-[0.15em] text-amber-400 mb-2">
              {availability === "not_available" ? "Not Available" : "Unavailable"}
            </p>
            <h1 className="font-heading text-2xl text-text-primary mb-2">
              Certificate Not Valid
            </h1>
            <p className="text-text-dim mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/"
                className="px-6 py-2 rounded-lg bg-brand text-base font-semibold no-underline hover:bg-opacity-90 transition-colors"
              >
                Return Home
              </Link>
              <Link
                to="/certificates"
                className="px-6 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-text-secondary no-underline hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                View My Certificates
              </Link>
            </div>
          </section>
        ) : certificate ? (
          // Success State
          <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-surface p-8">
            {/* Verification Badge */}
            <div className="text-center mb-8 pb-8 border-b border-[rgba(255,255,255,0.1)]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 bg-opacity-20 mb-4 text-green-400">
                <CheckIcon size={32} />
              </div>
              <p className="text-[0.85rem] uppercase tracking-[0.15em] text-green-400 mb-2">
                Available
              </p>
              <h1 className="font-heading text-3xl text-text-primary mb-2">
                Certificate Verified
              </h1>
              <p className="text-text-dim text-[0.95rem]">
                This is a valid certificate issued by Courseware
              </p>
            </div>

            {/* Certificate Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Certificate ID
                  </p>
                  <p className="text-lg font-mono text-text-primary break-all">
                    {certificate.id}
                  </p>
                </div>

                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Recipient
                  </p>
                  <p className="text-lg text-text-primary mb-1">{certificate.recipientName}</p>
                  <p className="text-sm text-text-dim">{certificate.recipientEmail}</p>
                </div>

                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Course
                  </p>
                  <p className="text-lg text-text-primary">{certificate.courseName}</p>
                  {certificate.courseDescription && (
                    <p className="text-sm text-text-dim mt-2">
                      {certificate.courseDescription}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Instructor
                  </p>
                  <p className="text-lg text-text-primary">{certificate.instructorName}</p>
                </div>

                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Issue Date
                  </p>
                  <p className="text-lg text-text-primary">
                    {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-[0.85rem] uppercase tracking-[0.1em] text-[#f59e0b] mb-2">
                    Verification Count
                  </p>
                  <p className="text-lg text-text-primary">
                    {certificate.verificationCount} verification(s)
                  </p>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img src={qrUrl} alt="Certificate QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-text-dim text-center">
                  Scan this QR code to verify this certificate on any device
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[rgba(245, 158, 11, 0.1)] border border-[#f59e0b] border-opacity-30 rounded-lg p-4 mb-8">
              <p className="text-sm text-text-secondary">
                <span className="inline-flex items-start gap-1.5"><InfoIcon size={15} className="shrink-0 mt-0.5" /> <strong>Certificate Information:</strong></span> This certificate has been issued by Courseware
                and can be shared publicly. The certificate ID contains cryptographic verification data to prevent forgery.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand text-base font-semibold hover:bg-opacity-90 transition-colors text-center cursor-pointer border-none"
              >
                <PrinterIcon size={16} /> Print Certificate
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0A66C2] text-white font-semibold hover:bg-[#084699] transition-colors text-center no-underline"
              >
                <LinkedInIcon size={16} /> Share on LinkedIn
              </a>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.1)] text-center text-sm text-text-faint">
              <p>
                This certificate was verified on{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-2">
                Learn more at{" "}
                <a href="/" className="text-[#f59e0b] no-underline hover:underline">
                  Courseware
                </a>
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default VerifyCertificate;
