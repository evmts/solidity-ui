import {
	Address,
	createClient,
	createContract,
	createTevmTransport,
	encodeFunctionData,
	Hex,
	hexToBytes,
	tevmDeploy,
	tevmMine,
} from "tevm";
import { createDocumentPrecompile } from "./createDocumentPrecompile";
import { EthjsAddress } from "tevm/utils";

export const mountApp = async (appBytecode: Hex) => {
	const app = createContract({
		name: "App",
		bytecode: appBytecode,
		humanReadableAbi: [
			"function run() public",
			"constructor(address _document)",
		] as const,
	});

	const client = createClient({
		name: "SolidityUI VM",
		transport: createTevmTransport({ loggingLevel: "trace" }),
	});

	const vm = await client.transport.tevm.getVm();

	const documentPrecompile = createDocumentPrecompile({
		client,
	});

	vm.evm.addCustomPrecompile(documentPrecompile.precompile());

	const { createdAddress } = await tevmDeploy(
		client,
		app.deploy(documentPrecompile.contract.address),
	);

	await tevmMine(client);

	await vm.evm.runCall({
		to: EthjsAddress.fromString(createdAddress as Address),
		data: hexToBytes(encodeFunctionData(app.write.run())),
	});
};
