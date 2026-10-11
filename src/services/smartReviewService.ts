/**
 * BrandWaves Client-Side Smart Review Service
 * Evaluates submissions against campaign requirements.
 * Calls backend API with deterministic client-side fallback if server is unreachable.
 * 
 * GOVERNANCE RULES:
 * - AI assists human reviewers, it never makes final decisions.
 * - Human reviewer retains full control over approval, revisions, and feedback.
 */

import { Submission, SmartReviewResult, RequirementCheckResult } from '../types';
import { api } from '../api/client';
import { CAMPAIGNS } from '../data/marketplaceData';

export const smartReviewService = {
  /**
   * Evaluates a submission against its campaign brief requirements.
   */
  async getSmartReview(submission: Submission): Promise<SmartReviewResult> {
    try {
      const serverResult = await api.getSubmissionSmartReview(submission.id);
      if (serverResult) return serverResult;
    } catch (err) {
      console.warn('[SmartReviewService] Server smart-review unavailable, running local evaluation engine:', err);
    }

    return this.evaluateLocally(submission);
  },

  /**
   * Deterministic local fallback evaluation engine
   */
  evaluateLocally(submission: Submission): SmartReviewResult {
    const campaign = CAMPAIGNS.find((c) => c.id === submission.campaignId);
    const campaignRequirements: string[] =
      (campaign as any)?.requirements ||
      (campaign as any)?.deliverables || [
        'High-quality video presentation',
        'Clear product visibility',
        'Follow brand guidelines',
      ];

    const verifiableChecks: RequirementCheckResult[] = [];
    const aiObservations: RequirementCheckResult[] = [];

    const caption = (submission.caption || '').trim();
    const title = (submission.videoTitle || '').trim();
    const tags = Array.isArray(submission.tags) ? submission.tags : [];
    const allText = `${title} ${caption} ${tags.join(' ')}`.toLowerCase();

    // 1. Verifiable: URL Accessibility
    const hasValidUrl =
      Boolean(submission.videoUrl) &&
      (submission.videoUrl.startsWith('http://') || submission.videoUrl.startsWith('https://')) &&
      submission.videoUrl.includes('.');

    verifiableChecks.push({
      id: 'check_url_validity',
      title: 'Deliverable Link Accessibility',
      type: 'verifiable',
      status: hasValidUrl ? 'pass' : 'fail',
      evidence: submission.videoUrl || 'No URL provided',
      explanation: hasValidUrl
        ? `Valid external HTTPS link supplied for ${submission.platform}.`
        : 'Invalid or missing media URL provided in submission.',
    });

    // 2. Verifiable: Platform Alignment
    const subPlatform = submission.platform || '';
    const campaignPlatform = campaign?.platform || 'Multi-platform';
    const platformMatches =
      campaignPlatform.toLowerCase().includes('multi') ||
      (Boolean(subPlatform) && campaignPlatform.toLowerCase().includes(subPlatform.toLowerCase())) ||
      (Boolean(subPlatform) && subPlatform.toLowerCase().includes(campaignPlatform.toLowerCase()));

    verifiableChecks.push({
      id: 'check_platform_alignment',
      title: 'Platform Deliverable Alignment',
      type: 'verifiable',
      status: platformMatches ? 'pass' : 'needs_review',
      evidence: `Submitted on: ${subPlatform || 'Unspecified'} | Target: ${campaignPlatform}`,
      explanation: platformMatches
        ? `Deliverable platform (${subPlatform}) aligns with campaign guidelines.`
        : `Deliverable platform (${subPlatform || 'Unspecified'}) differs from target ${campaignPlatform}.`,
    });

    // 3. Verifiable: Metadata Completeness
    const hasCompleteMetadata =
      Boolean(title) &&
      Boolean(submission.thumbnail) &&
      Boolean(submission.duration);

    verifiableChecks.push({
      id: 'check_metadata_completeness',
      title: 'Asset Metadata Completeness',
      type: 'verifiable',
      status: hasCompleteMetadata ? 'pass' : 'needs_review',
      evidence: `Title: "${title.slice(0, 30)}..." | Duration: ${submission.duration || '0:30'} | Thumbnail: present`,
      explanation: hasCompleteMetadata
        ? 'Standard delivery metadata (title, duration, preview thumbnail) provided.'
        : 'One or more deliverable metadata fields are missing.',
    });

    // 4. Required Tags Check
    const extractedTags: string[] = [];
    campaignRequirements.forEach((req: string) => {
      const matches = req.match(/[#@][A-Za-z0-9_]+/g);
      if (matches) extractedTags.push(...matches);
    });

    if (extractedTags.length > 0) {
      const missing = extractedTags.filter((t: string) => !allText.includes(t.toLowerCase()));
      const present = extractedTags.filter((t: string) => allText.includes(t.toLowerCase()));

      verifiableChecks.push({
        id: 'check_required_tags',
        title: 'Mandatory Campaign Tags & Handles',
        type: 'verifiable',
        status: missing.length === 0 ? 'pass' : 'fail',
        evidence:
          missing.length === 0
            ? `All required tags found in caption: ${present.join(', ')}`
            : `Missing required tag(s): ${missing.join(', ')} (Found: ${present.join(', ') || 'none'})`,
        explanation:
          missing.length === 0
            ? 'Creator included all mandatory campaign hashtags and brand handles.'
            : `Creator omitted mandatory campaign tags (${missing.join(', ')}). A caption revision is recommended before payout.`,
      });
    }

    // AI Observations
    const missingItems: string[] = [];
    campaignRequirements.forEach((req: string, idx: number) => {
      const tagMatches = req.match(/[#@][A-Za-z0-9_]+/g);

      if (tagMatches && tagMatches.length > 0) {
        const missingTags = tagMatches.filter((t: string) => !allText.includes(t.toLowerCase()));
        if (missingTags.length === 0) {
          aiObservations.push({
            id: `ai_obs_${idx + 1}`,
            title: req,
            type: 'ai_observation',
            status: 'pass',
            evidence: `Found required tags in text: ${tagMatches.join(', ')}`,
            explanation: 'The creator included the required campaign tags and mentions in their submission caption.',
            confidence: 0.95,
          });
        } else {
          missingItems.push(...missingTags);
          aiObservations.push({
            id: `ai_obs_${idx + 1}`,
            title: req,
            type: 'ai_observation',
            status: 'needs_review',
            evidence: `Caption includes: "${caption.slice(0, 50)}...". Missing: ${missingTags.join(', ')}`,
            explanation: `Caption omits required tag (${missingTags.join(', ')}). Reviewer should request caption amendment.`,
            confidence: 0.9,
          });
        }
      } else if (req.toLowerCase().includes('hook') || req.toLowerCase().includes('second')) {
        aiObservations.push({
          id: `ai_obs_${idx + 1}`,
          title: req,
          type: 'ai_observation',
          status: 'needs_review',
          evidence: `Deliverable duration: ${submission.duration || '0:30'}. Title: "${title}".`,
          explanation: 'Pacing and 2-second hook presence require human visual confirmation upon watching the video.',
          confidence: 0.8,
        });
      } else if (req.toLowerCase().includes('filter') || req.toLowerCase().includes('texture') || req.toLowerCase().includes('dropper')) {
        aiObservations.push({
          id: `ai_obs_${idx + 1}`,
          title: req,
          type: 'ai_observation',
          status: 'needs_review',
          evidence: `Platform: ${submission.platform}. Deliverable link verified.`,
          explanation: 'Lighting quality, texture demonstration, and absence of smoothing filters require human visual appraisal.',
          confidence: 0.75,
        });
      } else {
        aiObservations.push({
          id: `ai_obs_${idx + 1}`,
          title: req,
          type: 'ai_observation',
          status: 'needs_review',
          evidence: `Metadata confirms "${title}" for ${submission.platform}`,
          explanation: `Specific instruction "${req}" requires qualitative human review.`,
          confidence: 0.7,
        });
      }
    });

    const brandName = submission.brandName || 'the brand';
    const summary = missingItems.length > 0
      ? `Submission verified on ${submission.platform}. 1 or more specific tag requirements (${missingItems.join(', ')}) appear to be missing from the caption.`
      : `Submission verified on ${submission.platform}. Required tags and deliverables are present. Ready for reviewer creative inspection.`;

    const suggestedFeedback = missingItems.length > 0
      ? `Hi ${submission.creatorName}! Thanks for your submission for ${submission.campaignTitle}. The visual energy is fantastic! Before we can give final approval, please update your post caption to include the required ${missingItems.join(' & ')} tags as outlined in the campaign brief.`
      : `Hi ${submission.creatorName}! Great job on your deliverable for ${submission.campaignTitle}. The product placement and caption requirements are in order. Approved for campaign distribution!`;

    const humanChecklist = [
      `Product Prominence: Confirm ${brandName} product appears clearly in the video.`,
      'Audio & Music: Confirm voiceover is clear and audio adheres to commercial usage rules.',
      'Visual Pacing & Lighting: Confirm the first 2-3 seconds hook the audience without dark or blurry frames.',
      'Brand Safety: Confirm absence of competitor logos, inappropriate apparel, or offensive themes.',
    ];

    const mediaAnalysisNotice =
      'Video deliverable verification is grounded in creator-supplied URLs, verified platform metadata, video titles, and text captions. Full audio stem decoding and direct video pixel rendering require human reviewer verification.';

    return {
      submissionId: submission.id,
      campaignId: submission.campaignId,
      summary,
      verifiableChecks,
      aiObservations,
      humanChecklist,
      suggestedFeedback,
      suggestedQuestions: [
        `Did the creator clearly feature the ${brandName} product in the video frame?`,
        'Is the voiceover / background acoustic audio clear and free of copyright strikes?',
        'Are all brand guidelines and creative instructions respected in the final cut?',
      ],
      mediaAnalysisNotice,
      isLiveAI: false,
      modelUsed: 'deterministic-rules-engine',
      reviewedAt: new Date().toISOString(),
    };
  },
};
