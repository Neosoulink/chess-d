import { cn } from "@/shared/utils";
import { FC, MouseEventHandler, PropsWithChildren } from "react";

import { Button, Divider, Icon } from "../core";
import { TitleDivider } from "./title-divider";

import NeymarkChessBackgroundPath from "@/assets/images/illustrations/neymark-chess.jpg?url";

export interface ModalSectionProps extends PropsWithChildren {
	header?: {
		title: string;
		icon?: keyof typeof Icon;
	};
	footerOptions?: {
		label: string;
		icon?: keyof typeof Icon;
		disabled?: boolean;
		action?: MouseEventHandler<HTMLButtonElement>;
	}[];
	contentClassName?: string;
}

export const ModalSection: FC<ModalSectionProps> = ({
	header,
	children,
	footerOptions,
	contentClassName
}) => {
	return (
		<section className="flex items-center justify-center size-full z-0 py-5 relative">
			<img
				src={NeymarkChessBackgroundPath}
				alt="Neymark Chess Background"
				className="absolute top-0 left-0 w-full h-full object-cover object-center opacity-10 pointer-events-none scale-130"
			/>

			<div
				className={cn(
					"w-full max-w-10/12 min-w-fit h-full max-h-[700px]",
					"flex flex-col items-center gap-5 p-5 z-1"
				)}
			>
				{!!header && (
					<TitleDivider
						title={header.title}
						icon={header.icon}
						className="max-w-96 w-full"
					/>
				)}

				<div className="flex flex-col items-center w-full flex-1 max-h-10/12 gap-2">
					<Divider variant="light" />
					<div className="flex justify-center w-full overflow-y-scroll flex-1 pl-2">
						<div
							className={cn(
								"flex flex-col gap-5 pb-4 px-1 flex-1",
								"max-w-96 w-full",
								contentClassName
							)}
						>
							{children}
						</div>
					</div>
					<Divider variant="light" />
				</div>

				{!!footerOptions?.length && (
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-center gap-2">
							{footerOptions.map(({ label, icon, disabled, action }, index) => {
								const IconComponent = icon ? Icon[icon] : null;

								return (
									<Button
										key={`${label}-${index}`}
										onClick={action}
										disabled={disabled}
										className="text-xl capitalize"
									>
										{!!IconComponent && <IconComponent />}
										{label}
									</Button>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};
