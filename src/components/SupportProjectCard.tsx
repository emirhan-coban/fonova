import { HandHeart, HandsClapping, MapPin, UsersThree, Wrench } from "@phosphor-icons/react/dist/ssr";
import type { SupportProject } from "@/lib/support-projects";
import { VolunteerSupportButton } from "./VolunteerSupportButton";

function getSupportArtwork(category: string) {
  const normalized = category.toLocaleLowerCase("tr-TR");

  if (normalized.includes("mentor")) {
    return {
      Icon: HandsClapping,
      shell: "from-[#f7f4ff] via-[#eee8ff] to-[#e2daff]",
      orb: "bg-[radial-gradient(circle_at_35%_35%,rgba(46,9,136,0.74),rgba(46,9,136,0.14)_58%,transparent_74%)]",
      line: "from-[#2E0988]/72 via-[#2E0988]/28 to-transparent"
    };
  }

  if (normalized.includes("saha")) {
    return {
      Icon: Wrench,
      shell: "from-[#f7f4ff] via-[#ece7ff] to-[#e0d8ff]",
      orb: "bg-[radial-gradient(circle_at_35%_35%,rgba(46,9,136,0.74),rgba(46,9,136,0.14)_58%,transparent_74%)]",
      line: "from-[#2E0988]/72 via-[#2E0988]/26 to-transparent"
    };
  }

  return {
    Icon: UsersThree,
    shell: "from-[#f8f5ff] via-[#eee8ff] to-[#e2daff]",
    orb: "bg-[radial-gradient(circle_at_35%_35%,rgba(46,9,136,0.74),rgba(46,9,136,0.14)_58%,transparent_74%)]",
    line: "from-[#2E0988]/72 via-[#2E0988]/30 to-transparent"
  };
}

export function SupportProjectCard({ project }: { project: SupportProject }) {
  const artwork = getSupportArtwork(project.category);
  const CoverIcon = artwork.Icon;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_58px_-50px_rgba(46,9,136,0.16)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-accent/20">
      <div className={`relative min-h-44 overflow-hidden bg-gradient-to-br ${artwork.shell} sm:min-h-48`}>
        <div className={`absolute -left-8 top-5 h-24 w-24 rounded-full blur-2xl ${artwork.orb}`} />
        <div className={`absolute right-0 top-0 h-full w-2/3 bg-gradient-to-bl ${artwork.line}`} />
        <div className="absolute inset-x-6 bottom-6 top-6 rounded-[1.65rem] border border-white/65 bg-white/28 backdrop-blur-md" />
        <div className="absolute left-8 top-8 grid h-14 w-14 place-items-center rounded-[1.35rem] border border-white/75 bg-white/58 shadow-[0_20px_45px_-28px_rgba(46,9,136,0.24)] backdrop-blur-md">
          <CoverIcon size={28} weight="duotone" className="text-accent" />
        </div>
        <div className="absolute left-8 top-28 rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent backdrop-blur-md">
          {project.category}
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">{project.city}</p>
          <p className="mt-2 max-w-[18rem] text-lg font-semibold leading-tight text-slate-950">{project.organization}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-600">
          <MapPin size={15} weight="duotone" />
          <span>{project.city}</span>
        </div>
        <h3 className="text-xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-2xl">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.summary}</p>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">{project.goal}</span>
            <span className="font-mono font-semibold text-accent">%{project.progress}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 text-xs min-[380px]:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-slate-500">İhtiyaç</p>
            <p className="mt-1 font-mono text-slate-950">{project.volunteersNeeded} gönüllü</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-slate-500">Destek türü</p>
            <p className="mt-1 text-slate-950">{project.supportType}</p>
          </div>
        </div>
        <VolunteerSupportButton projectTitle={project.title} />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <HandHeart size={15} weight="duotone" />
          <span>{project.organization}</span>
        </div>
      </div>
    </article>
  );
}
