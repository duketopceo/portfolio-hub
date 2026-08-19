import Link from "next/link";
import {
  getDeploymentsBySlug,
  deploymentHostLabel,
  formatDeploymentUrl,
} from "@/lib/deployments";

interface DossierServicesTableProps {
  slug: string;
}

export function DossierServicesTable({ slug }: DossierServicesTableProps) {
  const services = getDeploymentsBySlug(slug);
  if (services.length === 0) return null;

  return (
    <div className="dossier-services overflow-x-auto">
      <table className="dossier-services__table">
        <caption className="sr-only">Production services and endpoints</caption>
        <thead>
          <tr>
            <th scope="col">URL</th>
            <th scope="col">Host</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc) => {
            const isRelative = svc.url.startsWith("/");
            const label = formatDeploymentUrl(svc.url);
            return (
              <tr key={`${svc.url}-${svc.host}`}>
                <td>
                  {isRelative ? (
                    <Link href={svc.url} className="detail-nav-link">
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={svc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-nav-link"
                    >
                      {label} ↗
                    </a>
                  )}
                </td>
                <td>{deploymentHostLabel(svc.host)}</td>
                <td>{svc.role}</td>
                <td>
                  <span
                    className={
                      svc.online
                        ? "dossier-services__status dossier-services__status--online"
                        : "dossier-services__status dossier-services__status--offline"
                    }
                  >
                    {svc.online ? "online" : "offline"}
                  </span>
                  {svc.healthCheck && (
                    <span className="dossier-services__health">
                      {svc.healthCheck}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
