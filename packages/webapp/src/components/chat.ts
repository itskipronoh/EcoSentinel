import {
	LitElement, css, html, nothing,
} from 'lit';
import {map} from 'lit/directives/map.js';
import {repeat} from 'lit/directives/repeat.js';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
import {
	customElement, property, state, query,
} from 'lit/decorators.js';
import {type AIChatCompletionDelta, type AIChatMessage} from '@microsoft/ai-chat-protocol';
import {type ChatRequestOptions, getCitationUrl, getCompletion} from '../api.js';
import {type ParsedMessage, parseMessageIntoHtml} from '../message-parser.js';
import sendSvg from '../../assets/send.svg?raw';
import questionSvg from '../../assets/question.svg?raw';
import newChatSvg from '../../assets/new-chat.svg?raw';

export type ChatComponentState = {
	hasError: boolean;
	isLoading: boolean;
	isStreaming: boolean;
};

export type ChatComponentOptions = ChatRequestOptions & {
	enablePromptSuggestions: boolean;
	promptSuggestions: string[];
	apiUrl?: string;
	strings: {
		promptSuggestionsTitle: string;
		citationsTitle: string;
		followUpQuestionsTitle: string;
		chatInputPlaceholder: string;
		chatInputButtonLabel: string;
		assistant: string;
		user: string;
		errorMessage: string;
		newChatButton: string;
		retryButton: string;
	};
};

export const chatDefaultOptions: ChatComponentOptions = {
	chunkIntervalMs: 30,
	apiUrl: '',
	enablePromptSuggestions: true,
	promptSuggestions: [
		'🌊 What is the flood risk in my area this week?',
		'🌱 When should I plant crops based on weather patterns?',
		'💨 How is the air quality in Nairobi today?',
		'🌳 Are there any deforestation alerts in Central Kenya?',
		'⚠️ What environmental risks should I prepare for?',
		'📍 Give me hyperlocal environmental predictions',
		'🏠 How can my community adapt to climate change?',
		'🚨 What should I do during environmental emergencies?',
	],
	messages: [],
	strings: {
		promptSuggestionsTitle: 'Ask EcoSentinel AI about environmental risks and guidance',
		citationsTitle: 'Environmental Data Sources:',
		followUpQuestionsTitle: 'Related environmental questions:',
		chatInputPlaceholder: 'Ask about environmental risks, weather forecasts, or local guidance... (English or Swahili)',
		chatInputButtonLabel: 'Send environmental query',
		assistant: 'EcoSentinel AI',
		user: 'You',
		errorMessage: 'Environmental intelligence service is temporarily unavailable. Please try again in a moment.',
		newChatButton: 'New environmental query',
		retryButton: 'Retry environmental query',
	},
};

/**
 * A chat component that allows the user to ask questions and get answers from an API.
 * The component also displays default prompts that the user can click on to ask a question.
 * The component is built as a custom element that extends LitElement.
 *
 * Labels and other aspects are configurable via the `option` property.
 * @element azc-chat
 * @fires messagesUpdated - Fired when the message thread is updated
 * @fires stateChanged - Fired when the state of the component changes
 * */
@customElement('azc-chat')
export class ChatComponent extends LitElement {
	@property({
		type: Object,
		converter: value => ({...chatDefaultOptions, ...JSON.parse(value ?? '{}')}),
	})
		options: ChatComponentOptions = chatDefaultOptions;

	@property() question = '';
	@property({type: Array}) messages: AIChatMessage[] = [];
	@property() userId = '';
	@property() sessionId = '';
	@state() protected hasError = false;
	@state() protected isLoading = false;
	@state() protected isStreaming = false;
	@query('.chat-container') protected chatContainerElement!: HTMLElement;
	@query('.messages') protected messagesElement!: HTMLElement;
	@query('.chat-input') protected chatInputElement!: HTMLElement;

	async onSuggestionClicked(suggestion: string) {
		this.question = suggestion;
		await this.onSendClicked();
	}

	onCitationClicked(citation: string) {
		const path = getCitationUrl(citation);
		window.open(path, '_blank');
	}

	onNewChatClicked() {
		this.messages = [];
		this.sessionId = '';
		this.fireMessagesUpdatedEvent();
	}

	async onKeyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			await this.onSendClicked();
		}
	}

	async onSendClicked(isRetry = false) {
		if (this.isLoading) {
			return;
		}

		this.hasError = false;
		if (!isRetry) {
			this.messages = [
				...this.messages,
				{
					content: this.question,
					role: 'user',
				},
			];
		}

		this.question = '';
		this.isLoading = true;
		this.scrollToLastMessage();
		try {
			const response = getCompletion({
				...this.options,
				messages: this.messages,
				context: {
					userId: this.userId,
					sessionId: this.sessionId,
				},
			});
			const chunks = response as AsyncGenerator<AIChatCompletionDelta>;
			const {messages} = this;
			const message: AIChatMessage = {
				content: '',
				role: 'assistant',
			};
			for await (const chunk of chunks) {
				if (chunk.delta.content) {
					this.isStreaming = true;
					message.content += chunk.delta.content;
					this.messages = [...messages, message];
				}

				const sessionId = (chunk.context as any)?.sessionId;
				if (!this.sessionId && sessionId) {
					this.sessionId = sessionId;
				}
			}

			this.isLoading = false;
			this.isStreaming = false;
			this.fireMessagesUpdatedEvent();
		} catch (error) {
			this.hasError = true;
			this.isLoading = false;
			this.isStreaming = false;
			console.error(error);
		}
	}

	override requestUpdate(name?: string, oldValue?: any) {
		if (name === 'messages') {
			this.scrollToLastMessage();
		} else if (name === 'hasError' || name === 'isLoading' || name === 'isStreaming') {
			const state = {
				hasError: this.hasError,
				isLoading: this.isLoading,
				isStreaming: this.isStreaming,
			};
			const stateUpdatedEvent = new CustomEvent('stateChanged', {
				detail: {state},
				bubbles: true,
			});
			this.dispatchEvent(stateUpdatedEvent);
		}

		super.requestUpdate(name, oldValue);
	}

	protected fireMessagesUpdatedEvent() {
		const messagesUpdatedEvent = new CustomEvent('messagesUpdated', {
			detail: {messages: this.messages},
			bubbles: true,
		});
		this.dispatchEvent(messagesUpdatedEvent);
	}

	protected scrollToLastMessage() {
		// Need to be delayed to run after the DOM refresh
		setTimeout(() => {
			const {bottom} = this.messagesElement.getBoundingClientRect();
			const {top} = this.chatInputElement.getBoundingClientRect();
			if (bottom > top) {
				this.chatContainerElement.scrollBy(0, bottom - top);
			}
		}, 0);
	}

	protected renderSuggestions = (suggestions: string[]) => html`
		<section class="suggestions-container">
		  <h2>${this.options.strings.promptSuggestionsTitle}</h2>
		  <div class="suggestions">
		    ${map(
		suggestions,
		suggestion => html`
			<button
			  class="suggestion"
			  @click=${async () => {
		await this.onSuggestionClicked(suggestion);
	}}
			>
			  ${suggestion}
			</button>
		`,
	)}
		  </div>
		</section>
	`;

	protected renderLoader = () =>
		this.isLoading && !this.isStreaming
			? html`
				<div class="message assistant loader">
				  <div class="message-body">
				    <slot name="loader"><div class="loader-animation"></div></slot>
				    <div class="message-role">${this.options.strings.assistant}</div>
				  </div>
				</div>
			`
			: nothing;

	protected renderMessage = (message: ParsedMessage) => html`
		<div class="message ${message.role} animation">
		  ${message.role === 'assistant' ? html`<slot name="message-header"></slot>` : nothing}
		  <div class="message-body">
		    <div class="content">${message.html}</div>
		    ${message.citations.length > 0
		? html`
			<div class="citations">
			  <div class="citations-title">${this.options.strings.citationsTitle}</div>
			  ${map(message.citations, this.renderCitation)}
			</div>
		`
		: nothing}
		  </div>
		  <div class="message-role">
		    ${message.role === 'user' ? this.options.strings.user : this.options.strings.assistant}
		  </div>
		</div>
	`;

	protected renderError = () => html`
		<div class="message assistant error">
		  <div class="message-body">
		    <span class="error-message">${this.options.strings.errorMessage}</span>
		    <button @click=${async () => this.onSendClicked(true)}>${this.options.strings.retryButton}</button>
		  </div>
		</div>
	`;

	protected renderCitation = (citation: string, index: number) =>
		html`
			<button
			      class="citation"
			      @click=${() => {
		this.onCitationClicked(citation);
	}}
			    >
			      ${index + 1}. ${citation}
			    </button>
		`;

	protected renderCitationReference = (_citation: string, index: number) => html`<sup>[${index}]</sup>`;

	protected renderFollowupQuestions = (questions: string[]) =>
		questions.length > 0
			? html`
				<div class="questions">
				  <span class="question-icon" title=${this.options.strings.followUpQuestionsTitle}>
				    ${unsafeSVG(questionSvg)} </span
				  >${map(
		questions,
		question => html`
			<button
			  class="question animation"
			  @click=${async () => {
		await this.onSuggestionClicked(question);
	}}
			>
			  ${question}
			</button>
		`,
	)}
				</div>
			`
			: nothing;

	protected renderChatInput = () => html`
		<div class="chat-input">
		  <button
		    class="button new-chat-button"
		    @click=${() => {
		this.onNewChatClicked();
	}}
		    title=${this.options.strings.newChatButton}
		    .disabled=${this.messages?.length === 0 || this.isLoading || this.isStreaming}
		  >
		    ${unsafeSVG(newChatSvg)}
		  </button>
		  <form class="input-form">
		    <textarea
		      class="text-input"
		      placeholder="${this.options.strings.chatInputPlaceholder}"
		      .value=${this.question}
		      autocomplete="off"
		      @input=${event => {
		this.question = event.target.value;
	}}
		      @keypress=${this.onKeyPressed}
		      .disabled=${this.isLoading}
		    ></textarea>
		    <button
		      class="submit-button"
		      @click=${async () => this.onSendClicked()}
		      title="${this.options.strings.chatInputButtonLabel}"
		      .disabled=${this.isLoading || !this.question}
		    >
		      ${unsafeSVG(sendSvg)}
		    </button>
		  </form>
		</div>
	`;

	protected override render() {
		const parsedMessages = this.messages.map(message => parseMessageIntoHtml(message, this.renderCitationReference));
		return html`
			<section class="chat-container">
			  ${this.options.enablePromptSuggestions
        && this.options.promptSuggestions.length > 0
        && this.messages.length === 0
		? this.renderSuggestions(this.options.promptSuggestions)
		: nothing}
			  <div class="messages">
			    ${repeat(parsedMessages, (_, index) => index, this.renderMessage)} ${this.renderLoader()}
			    ${this.hasError ? this.renderError() : nothing}
			    ${this.renderFollowupQuestions(parsedMessages.at(-1)?.followupQuestions ?? [])}
			  </div>
			  ${this.renderChatInput()}
			</section>
		`;
	}

	static override styles = css`
    :host {
      /* EcoSentinel AI Environmental Theme */
      --primary: var(--eco-primary, #40a957);
      --secondary: var(--eco-secondary, #2e7d32);
      --accent: var(--eco-accent, #4caf50);
      --error: var(--eco-danger, #f44336);
      --warning: var(--eco-warning, #ff9800);
      --info: var(--eco-info, #2196f3);
      --success: var(--eco-success, #4caf50);

      --text-color: var(--eco-text-primary, #1b1b1b);
      --text-invert-color: var(--eco-text-on-primary, #ffffff);
      --text-secondary: var(--eco-text-secondary, #666666);
      --disabled-color: var(--eco-text-tertiary, #999999);

      --bg: var(--eco-bg-primary, #fafafa);
      --card-bg: var(--eco-surface, #ffffff);
      --surface-variant: var(--eco-surface-variant, #e8f5e8);

      --card-shadow: var(--eco-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
      --border-color: var(--eco-border, #e0e0e0);

      --space-md: 12px;
      --space-xl: 24px;
      --space-xs: 6px;
      --space-xxs: 3px;
      --border-radius: var(--eco-border-radius, 12px);
      --focus-outline: 2px solid;
      --overlay-color: rgba(0 0 0 / 20%);

      /* Environmental-specific component styling */
      --error-color: var(--error);
      --error-border: 1px solid var(--error);
      --error-bg: #ffebee;

      --retry-button-color: var(--text-color);
      --retry-button-bg: var(--surface-variant);
      --retry-button-bg-hover: #d4f1d4;
      --retry-button-border: 1px solid var(--border-color);

      --suggestion-color: var(--text-color);
      --suggestion-border: 1px solid var(--border-color);
      --suggestion-bg: var(--card-bg);
      --suggestion-shadow: var(--card-shadow);

      --user-message-color: var(--text-invert-color);
      --user-message-border: none;
      --user-message-bg: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);

      --bot-message-color: var(--text-color);
      --bot-message-border: 1px solid var(--border-color);
      --bot-message-bg: var(--card-bg);

      --citation-color: var(--text-invert-color);
      --citation-bg: var(--info);
      --citation-bg-hover: #1976d2;

      --new-chat-button-color: var(--text-invert-color);
      --new-chat-button-bg: var(--primary);
      --new-chat-button-bg-hover: var(--secondary);

      --chat-input-color: var(--text-color);
      --chat-input-border: 1px solid var(--border-color);
      --chat-input-bg: var(--card-bg);

      --submit-button-color: var(--primary);
      --submit-button-border: none;
      --submit-button-bg: transparent;
      --submit-button-bg-hover: var(--surface-variant);

      container-type: size;
      font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
    }

    *:focus-visible {
      outline: var(--focus-outline) var(--primary);
      outline-offset: 2px;
    }

    .animation {
      animation: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    svg {
      fill: currentColor;
      width: 100%;
      height: 100%;
    }

    button {
      font-family: inherit;
      font-size: 1rem;
      border-radius: var(--border-radius);
      outline: var(--focus-outline) transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;

      &:not(:disabled) {
        cursor: pointer;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }
    }

    .chat-container {
      height: 100cqh;
      overflow: auto;
      container-type: inline-size;
      position: relative;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }

    .citation {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--citation-color);
      background: var(--citation-bg);
      border: none;
      padding: var(--space-xs) var(--space-md);
      margin-right: var(--space-xs);
      margin-top: var(--space-xs);
      border-radius: 20px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--citation-bg-hover);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
      }
    }

    .citations-title {
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }

    .suggestions-container {
      text-align: center;
      padding: var(--space-xl);
      background: var(--surface-variant);
      border-radius: var(--border-radius);
      margin: var(--space-xl);
    }

    .suggestions-container h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: var(--space-xl);
      font-size: 1.1rem;
    }

    .suggestions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-md);
    }

    @container (width < 768px) {
      .suggestions {
        grid-template-columns: 1fr;
        gap: var(--space-xs);
      }
    }

    .suggestion {
      padding: var(--space-xl) var(--space-md);
      color: var(--suggestion-color);
      background: var(--suggestion-bg);
      border: var(--suggestion-border);
      border-radius: var(--border-radius);
      box-shadow: var(--suggestion-shadow);
      text-align: left;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        outline: 2px solid var(--primary);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(64, 169, 87, 0.15);
      }
    }

    .messages {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      flex: 1;
      min-height: 0;
    }

    .user {
      align-self: end;
      color: var(--user-message-color);
      background: var(--user-message-bg);
      border: var(--user-message-border);
    }

    .assistant {
      color: var(--bot-message-color);
      background: var(--bot-message-bg);
      border: var(--bot-message-border);
      box-shadow: var(--card-shadow);
    }

    .message {
      position: relative;
      width: auto;
      max-width: 75%;
      border-radius: var(--border-radius);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);

      &.user {
        animation-name: fade-in-up;
        border-radius: var(--border-radius) var(--border-radius) 4px var(--border-radius);
      }

      &.assistant {
        border-radius: var(--border-radius) var(--border-radius) var(--border-radius) 4px;
      }
    }

    .message-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .content {
      white-space: pre-line;
      line-height: 1.6;
    }

    .message-role {
      position: absolute;
      right: var(--space-xl);
      bottom: -1.5em;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .questions {
      margin: var(--space-md) 0;
      color: var(--primary);
      text-align: right;
    }

    .question-icon {
      vertical-align: middle;
      display: inline-block;
      height: 1.7rem;
      width: 1.7rem;
      margin-bottom: var(--space-xs);
      margin-left: var(--space-xs);
      color: var(--primary);
    }

    .question {
      position: relative;
      padding: var(--space-xs) var(--space-md);
      margin-bottom: var(--space-xs);
      margin-left: var(--space-xs);
      vertical-align: middle;
      color: var(--primary);
      background: var(--card-bg);
      border: 1px solid var(--primary);
      border-radius: 20px;
      font-weight: 500;
      animation-name: fade-in-right;

      &:hover {
        background: var(--surface-variant);
        transform: translateY(-1px);
      }
    }

    .button,
    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs);
      border: var(--submit-button-border);
      background: var(--submit-button-bg);
      color: var(--submit-button-color);

      &:disabled {
        color: var(--disabled-color);
        opacity: 0.6;
      }

      &:hover:not(:disabled) {
        background: var(--submit-button-bg-hover);
      }
    }

    .submit-button {
      flex: 0 0 auto;
      padding: var(--space-md);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      align-self: flex-end;
    }

    .error {
      color: var(--error-color);
      background: var(--error-bg);
      border: var(--error-border);
      border-radius: var(--border-radius);

      & .message-body {
        flex-direction: row;
        align-items: center;
        gap: var(--space-md);
      }

      & button {
        flex: 0 0 auto;
        padding: var(--space-xs) var(--space-md);
        color: var(--retry-button-color);
        background: var(--retry-button-bg);
        border: var(--retry-button-border);
        font-weight: 500;

        &:hover {
          background: var(--retry-button-bg-hover);
        }
      }
    }

    .error-message {
      flex: 1;
      font-weight: 500;
    }

    .chat-input {
      position: sticky;
      bottom: 0;
      padding: var(--space-xl);
      padding-top: var(--space-md);
      background: linear-gradient(to top, var(--bg) 70%, transparent);
      backdrop-filter: blur(10px);
      display: flex;
      gap: var(--space-md);
      border-top: 1px solid var(--border-color);
    }

    .new-chat-button {
      flex: 0 0 auto;
      width: 48px;
      height: 48px;
      padding: var(--space-md);
      border-radius: 50%;
      background: var(--new-chat-button-bg);
      color: var(--new-chat-button-color);
      border: none;

      &:hover:not(:disabled) {
        background: var(--new-chat-button-bg-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 169, 87, 0.3);
      }

      &:disabled {
        opacity: 0.5;
      }
    }

    .input-form {
      display: flex;
      flex: 1 auto;
      background: var(--chat-input-bg);
      border: var(--chat-input-border);
      border-radius: var(--border-radius);
      padding: var(--space-md);
      box-shadow: var(--card-shadow);
      outline: var(--focus-outline) transparent;
      transition: all 0.2s ease;
      overflow: hidden;

      &:has(.text-input:focus-visible) {
        outline: var(--focus-outline) var(--primary);
        box-shadow: 0 0 0 3px rgba(64, 169, 87, 0.1);
      }
    }

    .text-input {
      padding: var(--space-xs);
      font-family: inherit;
      font-size: 1rem;
      flex: 1 auto;
      min-height: 2.5rem;
      max-height: 120px;
      border: none;
      resize: vertical;
      background: none;
      color: var(--chat-input-color);

      &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
      }

      &:focus {
        outline: none;
      }

      &:disabled {
        opacity: 0.7;
      }
    }

    .loader-animation {
      width: 80px;
      height: 4px;
      border-radius: var(--border-radius);
      overflow: hidden;
      background: linear-gradient(90deg, var(--surface-variant) 0%, var(--primary) 50%, var(--surface-variant) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes fade-in-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-in-right {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .animation {
        animation: none;
      }

      button:hover:not(:disabled) {
        transform: none;
      }
    }

    /* Environmental status integration */
    .environmental-context {
      background: var(--surface-variant);
      border-radius: var(--border-radius);
      padding: var(--space-md);
      margin-bottom: var(--space-md);
      border-left: 4px solid var(--primary);
    }

    .env-alert {
      background: #fff3e0;
      border-left-color: var(--warning);
    }

    .env-danger {
      background: #ffebee;
      border-left-color: var(--error);
    }

    .env-info {
      background: #e3f2fd;
      border-left-color: var(--info);
    }

    .user {
      align-self: end;
      color: var(--user-message-color);
      background: var(--user-message-bg);
      border: var(--user-message-border);
    }

    .assistant {
      color: var(--bot-message-color);
      background: var(--bot-message-bg);
      border: var(--bot-message-border);
      box-shadow: var(--card-shadow);
    }

    .message {
      position: relative;
      width: auto;
      max-width: 75%;
      border-radius: var(--border-radius);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);

      &.user {
        animation-name: fade-in-up;
        border-radius: var(--border-radius) var(--border-radius) 4px var(--border-radius);
      }

      &.assistant {
        border-radius: var(--border-radius) var(--border-radius) var(--border-radius) 4px;
      }
    }

    .message-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .content {
      white-space: pre-line;
      line-height: 1.6;
    }

    .message-role {
      position: absolute;
      right: var(--space-xl);
      bottom: -1.5em;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .questions {
      margin: var(--space-md) 0;
      color: var(--primary);
      text-align: right;
    }

    .question-icon {
      vertical-align: middle;
      display: inline-block;
      height: 1.7rem;
      width: 1.7rem;
      margin-bottom: var(--space-xs);
      margin-left: var(--space-xs);
      color: var(--primary);
    }

    .question {
      position: relative;
      padding: var(--space-xs) var(--space-md);
      margin-bottom: var(--space-xs);
      margin-left: var(--space-xs);
      vertical-align: middle;
      color: var(--primary);
      background: var(--card-bg);
      border: 1px solid var(--primary);
      border-radius: 20px;
      font-weight: 500;
      animation-name: fade-in-right;

      &:hover {
        background: var(--surface-variant);
        transform: translateY(-1px);
      }
    }

    .button,
    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs);
      border: var(--submit-button-border);
      background: var(--submit-button-bg);
      color: var(--submit-button-color);

      &:disabled {
        color: var(--disabled-color);
        opacity: 0.6;
      }

      &:hover:not(:disabled) {
        background: var(--submit-button-bg-hover);
      }
    }

    .submit-button {
      flex: 0 0 auto;
      padding: var(--space-md);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      align-self: flex-end;
    }

    .error {
      color: var(--error-color);
      background: var(--error-bg);
      border: var(--error-border);
      border-radius: var(--border-radius);

      & .message-body {
        flex-direction: row;
        align-items: center;
        gap: var(--space-md);
      }

      & button {
        flex: 0 0 auto;
        padding: var(--space-xs) var(--space-md);
        color: var(--retry-button-color);
        background: var(--retry-button-bg);
        border: var(--retry-button-border);
        font-weight: 500;

        &:hover {
          background: var(--retry-button-bg-hover);
        }
      }
    }

    .error-message {
      flex: 1;
      font-weight: 500;
    }

    .chat-input {
      position: sticky;
      bottom: 0;
      padding: var(--space-xl);
      padding-top: var(--space-md);
      background: linear-gradient(to top, var(--bg) 70%, transparent);
      backdrop-filter: blur(10px);
      display: flex;
      gap: var(--space-md);
      border-top: 1px solid var(--border-color);
    }

    .new-chat-button {
      flex: 0 0 auto;
      width: 48px;
      height: 48px;
      padding: var(--space-md);
      border-radius: 50%;
      background: var(--new-chat-button-bg);
      color: var(--new-chat-button-color);
      border: none;

      &:hover:not(:disabled) {
        background: var(--new-chat-button-bg-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 169, 87, 0.3);
      }

      &:disabled {
        opacity: 0.5;
      }
    }

    .input-form {
      display: flex;
      flex: 1 auto;
      background: var(--chat-input-bg);
      border: var(--chat-input-border);
      border-radius: var(--border-radius);
      padding: var(--space-md);
      box-shadow: var(--card-shadow);
      outline: var(--focus-outline) transparent;
      transition: all 0.2s ease;
      overflow: hidden;

      &:has(.text-input:focus-visible) {
        outline: var(--focus-outline) var(--primary);
        box-shadow: 0 0 0 3px rgba(64, 169, 87, 0.1);
      }
    }

    .text-input {
      padding: var(--space-xs);
      font-family: inherit;
      font-size: 1rem;
      flex: 1 auto;
      min-height: 2.5rem;
      max-height: 120px;
      border: none;
      resize: vertical;
      background: none;
      color: var(--chat-input-color);

      &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
      }

      &:focus {
        outline: none;
      }

      &:disabled {
        opacity: 0.7;
      }
    }

    .loader-animation {
      width: 80px;
      height: 4px;
      border-radius: var(--border-radius);
      overflow: hidden;
      background: linear-gradient(90deg, var(--surface-variant) 0%, var(--primary) 50%, var(--surface-variant) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes fade-in-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-in-right {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .animation {
        animation: none;
      }

      button:hover:not(:disabled) {
        transform: none;
      }
    }

    /* Environmental status integration */
    .environmental-context {
      background: var(--surface-variant);
      border-radius: var(--border-radius);
      padding: var(--space-md);
      margin-bottom: var(--space-md);
      border-left: 4px solid var(--primary);
    }

    .env-alert {
      background: #fff3e0;
      border-left-color: var(--warning);
    }

    .env-danger {
      background: #ffebee;
      border-left-color: var(--error);
    }

    .env-info {
      background: #e3f2fd;
      border-left-color: var(--info);
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		'azc-chat': ChatComponent;
	}
}
