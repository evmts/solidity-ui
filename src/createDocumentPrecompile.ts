import {
	Address,
	defineCall,
	definePrecompile,
	hexToBigInt,
	keccak256,
	numberToHex,
	stringToHex,
	TevmTransport,
} from "tevm";
import { IDocument } from "../contracts/Dom.sol";
import { createElementPrecompile } from "./createElementPrecompile";
import { Client } from "viem";
import { Hex } from "tevm/utils";

const DEFAULT_ADDRESS = `0x${"0420".repeat(10)}` as const;

/**
 * For methods like getElementById we do not allow null values because that doesn't
 * work very well with the evm. Instead we use an empty element (element[0]) to represent null.
 */
const emptyElementId = numberToHex(
	hexToBigInt(
		keccak256(stringToHex("tevm.experimental.createDocumentPrecompile")),
	),
).slice(0, 42) as Hex;
const emptyElement = document.createElement("div");

/**
 * Returns an incrementing id starting from the emptyElementId.
 */
const getId = (() => {
	let id = hexToBigInt(emptyElementId);
	return () => {
		id++;
		try {
			const out = numberToHex(id, { size: 20 });
			return out;
		} catch (e) {
			throw e;
		}
	};
})();

/**
 * Creates a Tevm Precopmpile contract for interfacing with the browser's document object.
 */
export const createDocumentPrecompile = <
	TAddress extends Address = typeof DEFAULT_ADDRESS,
>({
	address,
	client,
}: { address?: TAddress; client: Client<TevmTransport> }) => {
	const addressToElement = new Map<Address, HTMLElement>();
	const elementToAddress = new Map<HTMLElement, Address>();

	addressToElement.set(emptyElementId, emptyElement);
	elementToAddress.set(emptyElement, emptyElementId);

	const addElementToChain = async (element: HTMLElement) => {
		const id = getId();
		const vm = await client.transport.tevm.getVm();
		vm.evm.addCustomPrecompile(
			createElementPrecompile({
				addressToElement,
				address: id,
				element,
			}).precompile(),
		);
		console.log("element added to chain", id, element);
		addressToElement.set(id, element);
		elementToAddress.set(element, id);
		return id;
	};

	return definePrecompile({
		contract: IDocument.withAddress(address ?? DEFAULT_ADDRESS),
		call: defineCall(IDocument.abi, {
			getElementById: async ({ args }) => {
				const element = document.getElementById(args[0]) ?? emptyElement;
				const address =
					elementToAddress.get(element) ?? (await addElementToChain(element));
				return {
					returnValue: address,
					executionGasUsed: 0n,
				};
			},
			createElement: async ({ args }) => {
				return {
					returnValue: await addElementToChain(document.createElement(args[0])),
					executionGasUsed: 0n,
				};
			},
			querySelector: async ({ args }) => {
				const element =
					(document.querySelector(args[0]) as HTMLElement) ?? emptyElement;
				console.log("querySelector", args[0], element);
				const address =
					elementToAddress.get(element) ?? (await addElementToChain(element));
				console.log("returning address", address);
				return {
					returnValue: address,
					executionGasUsed: 0n,
				};
			},
		}),
	});
};
