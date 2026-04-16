import { getEmailTemplate } from "@/app/actions/email";
import EmailEditor from "./EmailEditor";

export default async function AdminEmailPage() {
  const template = await getEmailTemplate();

  if (!template) {
    return (
      <div className="p-20 text-center bg-white rounded-[3rem] border border-black/5 flex flex-col items-center gap-4 opacity-30 italic">
        Fehler beim Laden der Vorlage.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">E-Mail <span className="text-primary italic">Vorlage.</span></h1>
        <p className="text-slate-400 font-medium italic animate-pulse">Designen Sie die Bestätigungsmail, die Interessenten nach einer Anfrage erhalten.</p>
      </div>

      <EmailEditor template={template} />
    </div>
  );
}
