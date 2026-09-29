import { adminConfigured, isAdmin } from "@/lib/admin";
import { getTranslator } from "@/lib/i18n/server";
import { AdminPanel } from "@/components/admin-dashboard";
import { Notice, PageIntro } from "@/components/ui";

export async function generateMetadata() {
  const { tr } = await getTranslator();
  return {
    title: tr("Administrator"),
    robots: { index: false, follow: false },
  };
}
export default async function Page() {
  const { tr } = await getTranslator();
  const configured = adminConfigured();
  const signedIn = await isAdmin();
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("TEACHER WORKSPACE")}
        title={tr("Student results")}
        description={tr(
          "Review assessments, follow practice progress, and export your class results.",
        )}
      />
      {configured ? (
        <AdminPanel initialSignedIn={signedIn} />
      ) : (
        <Notice>{tr("The administrator panel is not configured.")}</Notice>
      )}
    </div>
  );
}
