import React, { useState } from 'react'

// Main App Component for the Sign Up Screen
export default function App() {
	// Form State
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	// UI & Navigation State
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [step, setStep] = useState<'signup' | 'verify' | 'complete'>('signup')
	const [verificationCode, setVerificationCode] = useState('')

	// Errors State
	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const [verifyError, setVerifyError] = useState('')
	const [resendMessage, setResendMessage] = useState('')

	// Form Validation Logic
	const validateSignUp = () => {
		const newErrors: { [key: string]: string } = {}

		if (!firstName.trim()) {
			newErrors.firstName = 'First name is required'
		}
		if (!lastName.trim()) {
			newErrors.lastName = 'Last name is required'
		}
		if (!email.trim()) {
			newErrors.email = 'Email address is required'
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Please enter a valid email address'
		}
		if (!password) {
			newErrors.password = 'Password is required'
		} else if (password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters'
		}
		if (password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// Sign Up Submit Handler
	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateSignUp()) return

		setIsLoading(true)
		// Simulate network request to send verification email
		setTimeout(() => {
			setIsLoading(false)
			setStep('verify')
		}, 1200)
	}

	// Verification Submit Handler
	const handleVerify = (e: React.FormEvent) => {
		e.preventDefault()
		if (verificationCode.length < 6) {
			setVerifyError('Please enter a valid 6-digit verification code')
			return
		}

		setIsLoading(true)
		setVerifyError('')

		setTimeout(() => {
			setIsLoading(false)
			setStep('complete')
		}, 1200)
	}

	// Resend Verification Code
	const handleResendCode = () => {
		setResendMessage('A new verification code has been sent to your email.')
		setTimeout(() => setResendMessage(''), 4000)
	}

	// Reset Form and Start Over
	const handleStartOver = () => {
		setStep('signup')
		setVerificationCode('')
		setVerifyError('')
		setErrors({})
	}

	// Render Account Verification Screen
	if (step === 'verify') {
		return (
			<div className='min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4 font-sans text-[#141822]'>
				<div className='w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-200'>
					{/* Wallex Brand Logo */}
					<div className='flex items-center gap-2 mb-6'>
						<div className='w-10 h-10 rounded-2xl bg-[#253BCE] text-white flex items-center justify-center font-black text-xl shadow-md'>
							W
						</div>
						<span className='text-2xl font-black tracking-tight text-[#141822]'>
							Wallex
						</span>
					</div>

					{/* Heading */}
					<h1 className='text-3xl font-extrabold text-[#141822] mb-2 leading-tight'>
						Verify your account
					</h1>

					{/* Subtext */}
					<p className='text-[#8A8D96] text-sm mb-6'>
						We sent a 6-digit verification code to{' '}
						<span className='font-bold text-[#141822]'>{email}</span>
					</p>

					{/* Verification Form */}
					<form onSubmit={handleVerify} className='space-y-4'>
						<div>
							<input
								type='text'
								maxLength={6}
								value={verificationCode}
								onChange={(e) =>
									setVerificationCode(e.target.value.replace(/\D/g, ''))
								}
								placeholder='000000'
								className='w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 text-center font-extrabold text-3xl tracking-widest text-[#141822] focus:outline-none focus:ring-2 focus:ring-[#253BCE] focus:bg-white transition'
							/>
							{verifyError && (
								<p className='text-[#FF6B4A] text-xs font-semibold mt-2'>
									{verifyError}
								</p>
							)}
						</div>

						{/* Verify Submit Button */}
						<button
							type='submit'
							disabled={isLoading}
							className='w-full bg-[#253BCE] hover:bg-[#1e30a5] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70'
						>
							{isLoading ? (
								<svg
									className='animate-spin h-5 w-5 text-white'
									viewBox='0 0 24 24'
									fill='none'
								>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'
									/>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8v8H4z'
									/>
								</svg>
							) : (
								'Verify Account'
							)}
						</button>
					</form>

					{/* Feedback Message */}
					{resendMessage && (
						<p className='text-[#00A896] text-xs font-semibold text-center mt-3'>
							{resendMessage}
						</p>
					)}

					{/* Resend & Reset Actions */}
					<div className='mt-6 text-center space-y-2'>
						<button
							type='button'
							onClick={handleResendCode}
							className='block w-full text-center text-[#253BCE] font-semibold text-sm hover:underline'
						>
							Didn&apos;t receive the code? Resend
						</button>
						<button
							type='button'
							onClick={handleStartOver}
							className='block w-full text-center text-[#8A8D96] font-medium text-sm hover:text-[#141822]'
						>
							Start over
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Render Registration Complete Screen
	if (step === 'complete') {
		return (
			<div className='min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4 font-sans text-[#141822]'>
				<div className='w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-200'>
					<div className='w-16 h-16 bg-[#84CC16]/20 text-[#84CC16] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold'>
						✓
					</div>
					<h1 className='text-3xl font-extrabold text-[#141822] mb-2'>
						Account Verified!
					</h1>
					<p className='text-[#8A8D96] text-sm mb-6'>
						Welcome to Wallex, <span className='font-bold'>{firstName}</span>.
						Your digital wallet and expense tracker are ready.
					</p>
					<button
						type='button'
						onClick={() => alert('Navigating to dashboard...')}
						className='w-full bg-[#253BCE] hover:bg-[#1e30a5] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 active:scale-[0.99] transition'
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		)
	}

	// Render Primary Sign Up Screen
	return (
		<div className='min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4 font-sans text-[#141822]'>
			<div className='w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-200'>
				{/* Brand Logo & Header */}
				<div className='flex items-center gap-2.5 mb-4'>
					<div className='w-10 h-10 rounded-2xl bg-[#253BCE] text-white flex items-center justify-center font-black text-xl shadow-md'>
						W
					</div>
					<span className='text-2xl font-black tracking-tight text-[#141822]'>
						Wallex
					</span>
				</div>

				{/* Main Heading */}
				<h1 className='text-3xl font-extrabold text-[#141822] mb-1 leading-tight'>
					Create Account
				</h1>

				{/* Brand Tagline with Palette Colors */}
				<div className='flex items-center gap-1.5 mb-2 text-sm font-bold'>
					<span className='text-[#253BCE]'>Track.</span>
					<span className='text-[#00A896]'>🔍 Manage.</span>
					<span className='text-[#84CC16]'>⚙️ Grow. 🌱</span>
				</div>

				{/* Subheading */}
				<p className='text-[#8A8D96] text-sm mb-6 font-medium'>
					Take control of your everyday finances
				</p>

				{/* Form inputs */}
				<form onSubmit={handleSignUp} className='space-y-3'>
					{/* First & Last Name Inputs */}
					<div className='flex gap-3'>
						<div className='flex-1'>
							<input
								type='text'
								placeholder='First name'
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								disabled={isLoading}
								className='w-full border border-slate-200 bg-white rounded-xl px-4 py-3.5 text-sm text-[#141822] placeholder-[#8A8D96] font-medium focus:outline-none focus:ring-2 focus:ring-[#253BCE] transition'
							/>
						</div>
						<div className='flex-1'>
							<input
								type='text'
								placeholder='Last name'
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								disabled={isLoading}
								className='w-full border border-slate-200 bg-white rounded-xl px-4 py-3.5 text-sm text-[#141822] placeholder-[#8A8D96] font-medium focus:outline-none focus:ring-2 focus:ring-[#253BCE] transition'
							/>
						</div>
					</div>
					{(errors.firstName || errors.lastName) && (
						<p className='text-[#FF6B4A] text-xs font-semibold'>
							{errors.firstName || errors.lastName}
						</p>
					)}

					{/* Email Input */}
					<div>
						<input
							type='email'
							placeholder='Email address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
							className='w-full border border-slate-200 bg-white rounded-xl px-4 py-3.5 text-sm text-[#141822] placeholder-[#8A8D96] font-medium focus:outline-none focus:ring-2 focus:ring-[#253BCE] transition'
						/>
						{errors.email && (
							<p className='text-[#FF6B4A] text-xs font-semibold mt-1'>
								{errors.email}
							</p>
						)}
					</div>

					{/* Password Input */}
					<div>
						<div className='relative flex items-center border border-slate-200 bg-white rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#253BCE] transition'>
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
								className='w-full text-sm text-[#141822] placeholder-[#8A8D96] font-medium focus:outline-none pr-8 bg-transparent'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 text-[#8A8D96] hover:text-[#141822] text-sm'
							>
								{showPassword ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
						{errors.password && (
							<p className='text-[#FF6B4A] text-xs font-semibold mt-1'>
								{errors.password}
							</p>
						)}
					</div>

					{/* Confirm Password Input */}
					<div>
						<div className='relative flex items-center border border-slate-200 bg-white rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#253BCE] transition'>
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder='Confirm password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={isLoading}
								className='w-full text-sm text-[#141822] placeholder-[#8A8D96] font-medium focus:outline-none pr-8 bg-transparent'
							/>
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='absolute right-3 text-[#8A8D96] hover:text-[#141822] text-sm'
							>
								{showConfirmPassword ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className='text-[#FF6B4A] text-xs font-semibold mt-1'>
								{errors.confirmPassword}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						disabled={isLoading}
						className='w-full bg-[#253BCE] hover:bg-[#1e30a5] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 active:scale-[0.99] transition mt-2 flex items-center justify-center gap-2 disabled:opacity-70'
					>
						{isLoading ? (
							<svg
								className='animate-spin h-5 w-5 text-white'
								viewBox='0 0 24 24'
								fill='none'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								/>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8v8H4z'
								/>
							</svg>
						) : (
							'Create Account'
						)}
					</button>

					{/* Redirect to Sign In Link */}
					<div className='flex justify-center items-center pt-2'>
						<span className='text-[#8A8D96] font-medium text-sm'>
							Already have an account?{' '}
						</span>
						<button
							type='button'
							onClick={() => alert('Redirecting to Sign In...')}
							className='text-[#253BCE] font-bold text-sm ml-1 hover:underline'
						>
							Sign In
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
