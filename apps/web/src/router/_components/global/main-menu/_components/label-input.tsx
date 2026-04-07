import { Button, Icon, Input } from "@/router/_components/core";
import { cn } from "@/shared/utils";
import { ComponentPropsWithRef, FC, useMemo } from "react";

export interface MainMenuLabelInputProps {
	labelProps?: ComponentPropsWithRef<"label">;
	inputProps?: ComponentPropsWithRef<typeof Input>;
	selectOptions?: { value?: string; label: string }[];
	extraActions?: {
		label: string;
		icon: keyof typeof Icon;
		action: (e: React.MouseEvent<HTMLButtonElement>) => void;
	}[];
	id?: string;
	disabled?: boolean;
}

export const MainMenuLabelInput: FC<MainMenuLabelInputProps> = ({
	labelProps,
	inputProps,
	selectOptions,
	extraActions,
	id,
	disabled
}) => {
	const hasSelectOptions = useMemo(
		() => Array.isArray(selectOptions) && selectOptions.length > 0,
		[selectOptions]
	);

	return (
		<div className="relative flex items-center w-full gap-2">
			<label
				{...{
					...labelProps,
					htmlFor: id || labelProps?.htmlFor,
					className: cn(
						"font-bold text-right text-light/50 min-w-48 text-shadow-none transition-all duration-250 h-10 absolute top-1/2 -translate-y-1/2 right-full mr-2 flex items-center justify-end",
						disabled && "opacity-50 pointer-events-none",
						inputProps?.invalid && "text-negative",
						labelProps?.className
					)
				}}
			/>

			<Input
				{...{
					...inputProps,
					id: id || inputProps?.id,
					className: cn(
						"flex-1 border-l-light/50 border-l-2",
						inputProps?.className
					),
					disabled: disabled || inputProps?.disabled,
					children: inputProps?.children
						? inputProps?.children
						: hasSelectOptions && selectOptions
							? selectOptions.map((option, index) => (
									<option key={`${option.value}-${index}`} value={option.value}>
										{option.label}
									</option>
								))
							: null
				}}
			/>

			{extraActions?.map((action) => {
				const IconComponent = Icon[action.icon];

				return (
					<Button
						key={action.label}
						title={action.label}
						className="text-2xl"
						onClick={action.action}
						type="button"
					>
						<IconComponent />
					</Button>
				);
			})}
		</div>
	);
};
