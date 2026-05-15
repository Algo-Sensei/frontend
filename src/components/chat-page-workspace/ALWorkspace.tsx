import './ALWorkspace.css';
import Visualizer from './Visualizer';

const ALWorkspace = ({code, showVisualizer, onVisualize, onClose}: any) => {
	return (
		<div className='workspace-panel'>
			<div className='workspace-header'>
				<div>
					<h3>AlgoSensei's Workspace</h3>
					<span>Brute-force linear search in Java</span>
				</div>

				<button onClick={onVisualize}>Visualize</button>
			</div>

			{showVisualizer && (
				<Visualizer code={code.code} />
			)}

			<div className='workspace-section'>
				<div className='workspace-label'>Java</div>
				<pre>{code.code}</pre>
			</div>

			<div className='workspace-section'>
				<div className='workspace-label'>Output</div>
				<pre>Target 30 found at index 2</pre>
			</div>

			<button onClick={onClose}>Close</button>
		</div>
	)
};

export default ALWorkspace;