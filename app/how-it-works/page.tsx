'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <>
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Buy Assets on the Counterparty DEX
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              XCPFOLIO is a centralized dispenser for Counterparty asset names.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The Challenge with Counterparty
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  In the Counterparty protocol, there are two distinct roles: <strong>asset issuers</strong> who 
                  create and control assets, and <strong>asset holders</strong> who trade tokens on the DEX.
                </p>
                <p>
                  While issuers can transfer ownership of their assets to other addresses, and holders can 
                  buy and sell issued tokens on the DEX, there{"'"}s been no way to trade asset ownership 
                  itself on the DEX—but we make it work just like that.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                XCPFOLIO Bridges the Gap
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Each name is paired with a XCPFOLIO subasset</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Buying that subasset claims the asset name</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Ownership transfers 2-3 blocks after order confirms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to own your Counterparty asset name
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Browse & Select
                </h3>
                <p className="text-gray-600">
                  Explore our curated collection of premium Counterparty asset names. Each name has a 
                  corresponding XCPFOLIO.ASSETNAME token with exactly 1 unit issued.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Purchase on DEX
                </h3>
                <p className="text-gray-600">
                  Buy the token on the Counterparty DEX using XCP. Our automated system monitors all 
                  purchases in real-time, 24/7.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Receive Ownership
                </h3>
                <p className="text-gray-600">
                  Within 2-3 blocks after your order confirms, ownership of the actual asset name transfers to your address. 
                  You now control the asset completely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Your Asset Comes Ready To Build
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Unlocked & Flexible</p>
                      <p className="text-sm text-gray-600">Full control to issue tokens and modify settings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Zero Supply Issued</p>
                      <p className="text-sm text-gray-600">Start fresh with your own token economics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Blank Description</p>
                      <p className="text-sm text-gray-600">Write your own story and branding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Divisible by Default</p>
                      <p className="text-sm text-gray-600">Can be changed to indivisible for NFTs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Ownership & Control
              </h2>
              <p className="text-gray-600 mb-6">
                When you purchase an asset name through XCPFOLIO, you receive full ownership rights. 
                The asset transfers to your address with all the flexibility you need to build your project.
              </p>
              <p className="text-gray-600">
                Unlike traditional domain names that expire, Counterparty asset names are yours forever. 
                No renewal fees, no expiration dates—just permanent ownership on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Can You Build?
            </h2>
            <p className="text-lg text-gray-600">
              Your asset name is a blank canvas for creativity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Memecoins</h3>
              <p className="text-sm text-gray-600">
                Launch the next viral token with a memorable name that captures attention
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">NFT Collections</h3>
              <p className="text-sm text-gray-600">
                Create unique digital art collections with indivisible token issuance
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Game Tokens</h3>
              <p className="text-sm text-gray-600">
                Build in-game economies with fungible or non-fungible game assets
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Just HODL</h3>
              <p className="text-sm text-gray-600">
                Secure a premium name as a digital asset that never expires
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">
                Transparent & Reliable
              </h2>
              <p className="text-blue-100 mb-6">
                While XCPFOLIO introduces a trusted element to facilitate ownership transfers, our system 
                is designed for maximum transparency and reliability:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-50">Automated monitoring system runs 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-50">Ownership transfers typically complete in 2-3 blocks</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-50">All transactions are verifiable on the blockchain</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-50">Clear pricing with no hidden fees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about XCPFOLIO
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* FAQ 1 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Can I resell the subasset token after buying it?
                </h3>
                <p className="text-gray-600">
                  Yes, you can technically resell or transfer the XCPFOLIO.ASSETNAME token after purchasing it, but it will 
                  no longer trigger ownership transfer of the main asset. Once the first buyer receives ownership of the 
                  main asset, we update the subasset's description to reflect its "unavailable" status. The token essentially 
                  becomes a collectible with no utility. The real value is in the main asset that you now control completely.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  How quickly will I receive ownership after purchase?
                </h3>
                <p className="text-gray-600">
                  After your DEX order confirms on the blockchain, we wait 1 block for security, then initiate the ownership 
                  transfer which takes 2-3 additional blocks. Total time: approximately 30-40 minutes after your initial 
                  purchase transaction. Our automated system monitors the blockchain 24/7.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Will the asset be reset or have any prior history?
                </h3>
                <p className="text-gray-600">
                  All assets come in a "blank canvas" state: unlocked, with zero supply issued, no description, 
                  and set to divisible by default. While the blockchain will show the asset's creation date and our 
                  initial ownership, there will be no tokens in circulation or any restrictions on what you can build. 
                  You have complete freedom to configure the asset however you want.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Why can{"'"}t this be done in a completely trustless way?
                </h3>
                <p className="text-gray-600">
                  The Counterparty protocol distinguishes between asset ownership (who controls the asset{"'"}s settings 
                  and issuance) and token ownership (who holds issued tokens). While tokens can be traded on the DEX, 
                  the protocol doesn{"'"}t natively support trading asset ownership itself on the DEX. XCPFOLIO bridges 
                  this gap by acting as a trusted intermediary that monitors purchases and executes ownership transfers 
                  automatically.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  What happens if there{"'"}s a problem with my transfer?
                </h3>
                <p className="text-gray-600">
                  Our system has 24/7 automated monitoring. All transactions are recorded on-chain. If you experience 
                  delays beyond 4 blocks, contact support with your transaction ID.
                </p>
              </div>

              {/* FAQ 6 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Can I change the asset from divisible to indivisible?
                </h3>
                <p className="text-gray-600">
                  Yes! You have full control - change divisibility (perfect for NFTs), add descriptions, issue tokens 
                  with your chosen supply, or lock the asset to prevent further changes.
                </p>
              </div>

              {/* FAQ 7 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Are there any ongoing fees or renewal costs?
                </h3>
                <p className="text-gray-600">
                  No, Counterparty assets are permanent. Once you own it, it{"'"}s yours forever - no renewal fees or 
                  maintenance costs. Only standard Bitcoin network fees apply when issuing tokens or transferring.
                </p>
              </div>

              {/* FAQ 8 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  What{"'"}s the difference between the asset and the subasset?
                </h3>
                <p className="text-gray-600">
                  The asset (e.g., "BACH") is what you're buying - the valuable Counterparty name. The subasset 
                  ("XCPFOLIO.BACH") is just a receipt for the DEX sale. Once purchased, we transfer the real asset to you.
                </p>
              </div>

              {/* FAQ 9 - Why use XCPFOLIO subassets */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Why use XCPFOLIO subassets instead of selling assets directly?
                </h3>
                <p className="text-gray-600">
                  The XCPFOLIO name provides trust and clear sold status updates. Most importantly, your asset{"'"}s 
                  history stays clean - these are pristine, unused assets with no prior transaction baggage.
                </p>
              </div>

              {/* FAQ 10 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Can I buy multiple assets?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Purchase as many as you want. Each is a separate DEX transaction with automatic ownership 
                  transfer. Many users build portfolios of premium names for different projects.
                </p>
              </div>

              {/* FAQ 11 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Where do these asset names come from?
                </h3>
                <p className="text-gray-600">
                  These names come from 21e14{"'"}s private portfolio, collected before Ethereum{"'"}s mainnet and ENS existed. 
                  With domain name experience, we invested early in memorable Counterparty names. Now offering them to 
                  encourage Counterparty adoption - its unique naming system is a real advantage over contract addresses. 
                </p>
              </div>

              {/* FAQ 12 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Isn{"'"}t this like domain squatting?
                </h3>
                <p className="text-gray-600">
                  While some may see it that way, our large investment has kept us aligned with Counterparty{"'"}s success 
                  through these illiquid assets. We{"'"}ve been good stewards of these names for years. Now that Bitcoin 
                  metaprotocols are better understood, it{"'"}s time to make them available for use.
                </p>
              </div>

              {/* FAQ 13 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  How do I know which assets are still available?
                </h3>
                <p className="text-gray-600">
                  Our marketplace only shows currently available assets. Sold assets are automatically removed. Each page 
                  displays live DEX order books with real-time prices and availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Own Your Asset Name?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse our collection and find the perfect name for your project
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Available Names
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}