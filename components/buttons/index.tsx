import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
	children: React.ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	bgColor?: string;
	textColor?: string;
	className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const baseStyles =
	"w-fit inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
	primary: "bg-white text-black hover:bg-neutral-200 focus-visible:ring-white",
	secondary:
		"bg-neutral-800 text-white hover:bg-neutral-700 focus-visible:ring-neutral-500",
	ghost: "bg-transparent text-white hover:bg-white/10 focus-visible:ring-white",
	outline:
		"border border-white/20 text-white hover:bg-white/10 focus-visible:ring-white",
};

const sizes: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-12 px-6 text-base",
};

export function Button({
	children,
	variant = "primary",
	size = "md",
	leftIcon,
	rightIcon,
	bgColor,
	textColor,
	className,
	...props
}: ButtonProps) {
	return (
		<button
			className={clsx(
				baseStyles,
				sizes[size],
				bgColor ? `${bgColor} ${textColor ?? "text-white"}` : variants[variant],
				className
			)}
			{...props}
		>
			{leftIcon && <span className="flex items-center">{leftIcon}</span>}

			<span>{children}</span>

			{rightIcon && <span className="flex items-center">{rightIcon}</span>}
		</button>
	);
}
