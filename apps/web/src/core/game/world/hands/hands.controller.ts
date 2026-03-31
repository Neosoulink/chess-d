import { ChessboardModule } from "@chess-d/chessboard";
import { ColorSide, ObservablePayload } from "@chess-d/shared";
import { gsap } from "gsap";
import {
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share,
	Subject,
	switchMap
} from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { MessageData } from "@/shared/types";
import {
	HAND_ENDED_EMOTE_TOKEN,
	HAND_STARTED_EMOTE_TOKEN,
	HAND_WILL_EMOTE_TOKEN
} from "@/shared/tokens/emote.token";
import { HANDS_SUPPORT_EMOTES } from "@/shared/constants";
import { WorldController } from "../world.controller";
import { PiecesController } from "../chessboard/pieces/pieces.controller";
import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { HandsService } from "./hands.service";

@scoped(Lifecycle.ContainerScoped)
export class HandsController {
	public readonly emote$$ = new Subject<{
		duration: number;
		emote: (typeof HANDS_SUPPORT_EMOTES)[number];
		side: ColorSide;
	}>();

	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;
	public readonly step$: WorldController["step$"];
	public readonly pieceSelected$?: Observable<
		ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceSelected$"]>
		>
	>;
	public readonly pieceMoving$?: Observable<
		ObservablePayload<ReturnType<ChessboardModule["pieces"]["getPieceMoving$"]>>
	>;
	public readonly animatedPlayerMovedPiece$: Observable<
		ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	>;
	public readonly pieceDeselected$?: Observable<
		ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceDeselected$"]>
		>
	>;
	public readonly emoteStarted$?: Observable<
		ObservablePayload<HandsController["emote$$"]> & {
			mixer: AnimationMixer;
			idleAction: AnimationAction;
			emoteAction: AnimationAction;
		}
	>;
	public readonly emoteProgress$?: Observable<
		ObservablePayload<HandsController["emoteStarted$"]> & {
			progress: number;
		}
	>;
	public readonly emoteEnded$?: Observable<
		ObservablePayload<HandsController["emoteStarted$"]>
	>;

	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(WorldController)
		private readonly _worldController: WorldController,
		@inject(PiecesController)
		private readonly _piecesController: PiecesController,
		@inject(HandsService)
		private readonly _handsService: HandsService
	) {
		this.reset$ = this._worldController.resetDone$$.pipe(share());
		this.step$ = this._worldController.step$.pipe(share());
		this.pieceSelected$ = this._chessboard.pieces
			.getPieceSelected$()
			?.pipe(share());
		this.pieceMoving$ = this._chessboard.pieces
			.getPieceMoving$()
			?.pipe(share());
		this.animatedPlayerMovedPiece$ =
			this._piecesController.animatedPlayerMovedPiece$?.pipe(share());
		this.pieceDeselected$ = this._chessboard.pieces
			.getPieceDeselected$()
			?.pipe(share());

		this.emoteStarted$ = merge(
			this.emote$$,
			fromEvent(self, "message").pipe(
				filter<any>(
					({
						data
					}: MessageEvent<
						MessageData<ObservablePayload<HandsController["emote$$"]>>
					>) => {
						if (data.token !== HAND_WILL_EMOTE_TOKEN) return false;

						const { duration, emote, side } = data.value || {};

						return !!(
							typeof duration === "number" &&
							HANDS_SUPPORT_EMOTES.some((token) => token.key === emote?.key) &&
							typeof side === "string"
						);
					}
				),
				map(
					(
						e: MessageEvent<
							MessageData<ObservablePayload<HandsController["emote$$"]>>
						>
					) => e.data.value!
				)
			)
		).pipe(
			map((payload) => {
				const hand = this._handsService.hands[payload.side];
				const mixer = hand.animation.mixer;
				const idleAction = hand.animation.idleAction;
				const emoteClip = this._handsService.animationClips?.find(
					(clip) => clip.name === payload.emote.key
				);
				const emoteAction = emoteClip && mixer?.clipAction(emoteClip);

				if (!mixer || !idleAction || !emoteClip || !emoteAction)
					return undefined;

				self.postMessage({
					token: HAND_STARTED_EMOTE_TOKEN,
					value: payload
				} satisfies MessageData<ObservablePayload<HandsController["emote$$"]>>);

				return {
					...payload,
					mixer,
					idleAction,
					emoteAction
				};
			}),
			filter((payload) => payload !== undefined),
			share()
		);
		this.emoteProgress$ = this.emoteStarted$.pipe(
			switchMap((payload) => {
				return new Observable<
					ObservablePayload<HandsController["emoteProgress$"]>
				>((subscriber) => {
					const params = { progress: 0 };

					gsap.to(params, {
						duration: payload.duration,
						progress: 1,
						onUpdate: () =>
							subscriber.next({ ...payload, progress: params.progress }),
						onComplete: () => subscriber.complete()
					});
				});
			}),
			share()
		);
		this.emoteEnded$ = this.emoteProgress$.pipe(
			map((payload) => {
				const { duration, emote, side } = payload;
				self.postMessage({
					token: HAND_ENDED_EMOTE_TOKEN,
					value: {
						duration,
						emote,
						side
					}
				} satisfies MessageData<ObservablePayload<HandsController["emote$$"]>>);
				return payload;
			}),
			filter(({ progress }) => progress === 1),
			share()
		);
	}
}
