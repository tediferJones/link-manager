export function trapFocus(node: Element) {
	const previous = document.activeElement;

	function focusable(): HTMLDivElement[] {
		return Array.from(node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const current = document.activeElement;

		const elements = focusable();
		const first = elements.at(0) as HTMLDivElement;
		const last = elements.at(-1) as HTMLDivElement;

		if (event.shiftKey && current === first) {
			last.focus();
			event.preventDefault();
		}

		if (!event.shiftKey && current === last) {
			first.focus();
			event.preventDefault();
		}
	}

	$effect(() => {
		focusable()[0]?.focus();
		// TODO finish writing the action
    node.addEventListener('keydown', handleKeydown);

    return () => {
      node.removeEventListener('keydown', handleKeydown);
      previous?.focus();
    }
	});
}
