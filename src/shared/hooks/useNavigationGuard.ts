import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook to handle protected navigation with confirmation dialogs for quiz pages.
 * 
 * Detects if the user is on a quiz page and has unsaved changes,
 * showing a confirmation dialog before allowing navigation away.
 */
export function useNavigationGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const isInQuizPage = useCallback(() => {
    // Check if current page is a quiz page: /study-plans/:id/modules/:moduleId/skip-quiz or take-quiz
    return /\/study-plans\/\d+\/modules\/\d+\/(skip-quiz|take-quiz)/.test(pathname);
  }, [pathname]);

  const hasUnsavedChanges = useCallback(() => {
    // Check if document has a data attribute set by QuizAttemptPage
    // This will be set via a global event or context
    const hasChanges = document.documentElement.getAttribute('data-quiz-unsaved-changes');
    return hasChanges === 'true';
  }, []);

  const shouldConfirmNavigation = useCallback(() => {
    return isInQuizPage() && hasUnsavedChanges();
  }, [isInQuizPage, hasUnsavedChanges]);

  const navigateWithGuard = useCallback(
    async (href: string) => {
      if (!shouldConfirmNavigation()) {
        router.push(href);
        return;
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        'You have unsaved answers in the quiz. Do you want to leave without saving?'
      );

      if (confirmed) {
        router.push(href);
      }
    },
    [shouldConfirmNavigation, router]
  );

  return {
    navigateWithGuard,
    shouldConfirmNavigation,
    isInQuizPage,
  };
}
