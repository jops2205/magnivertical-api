type Transition<T extends string> = Readonly<Record<T, ReadonlyArray<T>>>;

export class StateMachine<T extends string> {
	constructor(private readonly transition: Transition<T>) {}

	isTransitionValid(from: T, to: T) {
		return this.transition[from].includes(to);
	}
}
