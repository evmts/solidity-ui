import { Address, defineCall, definePrecompile } from "tevm";
import { IElement } from "../contracts/Dom.sol";
import { InvalidAddressError } from "tevm/errors";

interface ElementPrecompileParams<TAddress extends Address> {
	address: TAddress;
	element: HTMLElement;
	addressToElement: Map<Address, HTMLElement>;
}

export const createElementPrecompile = <TAddress extends Address>({
	element,
	address,
	addressToElement,
}: ElementPrecompileParams<TAddress>) => {
	return definePrecompile({
		contract: IElement.withAddress(address),
		call: defineCall(IElement.abi, {
			setInnerHTML: async ({ args }) => {
				console.log("setInnerHTML", args[0]);
				element.innerHTML = args[0];
				return {
					executionGasUsed: 0n,
					returnValue: undefined,
				};
			},
			appendChild: async ({ args }) => {
				const child = addressToElement.get(args[0]);
				if (!child) {
					return {
						executionGasUsed: 0n,
						returnValue: undefined,
						error: new InvalidAddressError(
							`No dom element contract found at address ${args[0]}`,
						),
					};
				}
				element.appendChild(child);
				return {
					executionGasUsed: 0n,
					returnValue: undefined,
				};
			},
			removeChild: async ({ args }) => {
				const child = addressToElement.get(args[0]);
				if (!child) {
					return {
						executionGasUsed: 0n,
						returnValue: undefined,
						error: new InvalidAddressError(
							`No dom element contract found at address ${args[0]}`,
						),
					};
				}
				element.removeChild(child);
				return {
					executionGasUsed: 0n,
					returnValue: undefined,
				};
			},
			setAttribute: async ({ args }) => {
				element.setAttribute(args[0], args[1]);
				return {
					executionGasUsed: 0n,
					returnValue: undefined,
				};
			},
			value: async () => {
				return {
					returnValue: (element as HTMLInputElement).value,
					executionGasUsed: 0n,
				};
			},
		}),
	});
};
