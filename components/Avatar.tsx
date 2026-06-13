interface AvatarProps {
  nickname: string;
  avatar?: string;
  supportedTeam?: string;
  avatarColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm:  { outer: "w-8 h-8",   text: "text-sm",  badge: "text-sm  -bottom-0.5 -right-0.5", border: "border-2" },
  md:  { outer: "w-10 h-10", text: "text-base", badge: "text-base -bottom-1   -right-1",   border: "border-2" },
  lg:  { outer: "w-14 h-14", text: "text-2xl",  badge: "text-xl  -bottom-1   -right-1",   border: "border-[3px]" },
  xl:  { outer: "w-24 h-24", text: "text-4xl",  badge: "text-2xl -bottom-1   -right-1",   border: "border-4" },
};

export default function Avatar({ nickname, avatar, supportedTeam, avatarColor, size = "md" }: AvatarProps) {
  const s = sizes[size];
  const bg = avatarColor || "linear-gradient(135deg,#FFD700,#FFA500)";
  const style = avatarColor
    ? { background: avatarColor }
    : { background: "linear-gradient(135deg,#FFD700,#FFA500)" };

  return (
    <div className={`relative flex-shrink-0 ${s.outer}`}>
      <div
        className={`${s.outer} rounded-full flex items-center justify-center font-black ${s.border} border-white/10`}
        style={style}
      >
        {avatar
          ? <span className={s.text}>{avatar}</span>
          : <span className={`${s.text} text-black`}>{nickname[0]?.toUpperCase()}</span>
        }
      </div>
      {supportedTeam && (
        <span className={`absolute ${s.badge} bg-gray-900 rounded-full border border-gray-700 leading-none`}>
          {supportedTeam}
        </span>
      )}
    </div>
  );
}
