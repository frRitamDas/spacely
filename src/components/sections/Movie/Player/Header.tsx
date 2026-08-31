import { cn } from "@/utils/helpers";
import { ArrowLeft, Server } from "@/utils/icons";
import ActionButton from "./ActionButton";

interface MoviePlayerHeaderProps {
  id: number;
  movieName: string;
  hidden?: boolean;
  onOpenSource: () => void;
}

const MoviePlayerHeader: React.FC<MoviePlayerHeaderProps> = ({
  id,
  movieName,
  hidden,
  onOpenSource,
}) => {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className={cn(
        "absolute top-0 z-40 flex w-full items-start justify-between gap-3 p-3 md:p-5",
        "bg-linear-to-b from-black/90 via-black/35 to-transparent text-white transition-all duration-300",
        { "pointer-events-none -translate-y-3 opacity-0": hidden },
      )}
    >
      <div className="glass-strong flex items-center gap-2 rounded-2xl p-1 shadow-2xl">
        <ActionButton label="Back" href={`/movie/${id}`}>
          <ArrowLeft size={28} />
        </ActionButton>
      </div>

      <div className="pointer-events-none hidden max-w-[55vw] rounded-2xl border border-white/10 bg-black/35 px-5 py-2.5 text-center shadow-xl backdrop-blur-xl sm:block">
        <p className="truncate text-sm font-semibold text-white md:text-base">{movieName}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-white/45">Now playing</p>
      </div>

      <div className="glass-strong flex items-center gap-2 rounded-2xl p-1 shadow-2xl">
        <ActionButton label="Sources" tooltip="Playback sources" onClick={onOpenSource}>
          <Server size={26} />
        </ActionButton>
      </div>
    </div>
  );
};

export default MoviePlayerHeader;
