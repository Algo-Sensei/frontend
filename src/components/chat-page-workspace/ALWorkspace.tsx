import './ALWorkspace.css';
import Visualizer from './Visualizer';

const ALWorkspace = ({code, showVisualizer, onVisualize, onClose}: any) => {
	return (
		<div className='workspace-panel' style={{
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			background: '#1e1e1e',
			color: '#fff',
			padding: '24px'
		}}>
			<div className='workspace-header' style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				marginBottom: '32px'
			}}>
				<div>
					<h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>AlgoSensei's Workspace</h2>
					<span style={{ fontSize: '14px', opacity: 0.7 }}>Brute-force linear search in Java</span>
				</div>

				<button onClick={onVisualize} style={{
					background: 'linear-gradient(135deg, #e54d42 0%, #a82e26 100%)',
					color: '#fff',
					border: 'none',
					padding: '10px 24px',
					borderRadius: '8px',
					cursor: 'pointer',
					fontWeight: 'bold',
					boxShadow: '0 4px 12px rgba(229, 77, 66, 0.3)'
				}}>Visualize</button>
			</div>

			<div className='workspace-section' style={{ marginBottom: '24px' }}>
				<div className='workspace-label' style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>Visualize</div>
				{showVisualizer && (
					<Visualizer code={code.code} />
				)}
			</div>

			<div className='workspace-section' style={{ marginBottom: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
				<div className='workspace-label' style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>Java:</div>
				<div style={{
					background: '#121212',
					border: '1px solid #333',
					borderRadius: '12px',
					overflow: 'hidden',
					flex: 1,
					display: 'flex',
					flexDirection: 'column'
				}}>
					<div style={{
						background: '#252525',
						padding: '8px 16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						fontSize: '12px',
						borderBottom: '1px solid #333'
					}}>
						<span>BruteForceSearch.java</span>
						<div style={{ display: 'flex', gap: '8px' }}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
						</div>
					</div>
					<pre style={{
						margin: 0,
						padding: '16px',
						fontSize: '13px',
						lineHeight: '1.6',
						overflow: 'auto',
						color: '#d4d4d4',
						fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
					}}>{code.code}</pre>
				</div>
			</div>

			<div className='workspace-section'>
				<div className='workspace-label' style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>Output:</div>
				<div style={{
					background: '#121212',
					border: '1px solid #333',
					borderRadius: '12px',
					padding: '16px',
					fontSize: '13px',
					color: '#fff',
					minHeight: '80px'
				}}>
					<pre style={{ margin: 0 }}>Target 30 found at index 2</pre>
				</div>
			</div>

			<button onClick={onClose} style={{
				position: 'absolute',
				left: '-40px',
				top: '50%',
				transform: 'translateY(-50%)',
				background: '#333',
				border: 'none',
				color: '#fff',
				width: '40px',
				height: '40px',
				borderRadius: '8px 0 0 8px',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
			</button>
		</div>
	)
};

export default ALWorkspace;