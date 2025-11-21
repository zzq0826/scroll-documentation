import { useState, useEffect } from "preact/hooks"
import i18next, { t } from "i18next"

/**
 * Hook to ensure i18next is ready before using translations
 * Use this in client components that use i18next t() function
 */
export function useI18next(lang?: string) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkReady = () => {
      if (i18next.isInitialized && (!lang || i18next.language === lang)) {
        setIsReady(true)
      }
    }

    const init = async () => {
      // Check if already ready (from HeadCommon script)
      if (typeof window !== "undefined" && (window as any).__i18nextReady) {
        // Still need to ensure language is correct
        if (lang && i18next.language !== lang) {
          await i18next.changeLanguage(lang)
        }
        checkReady()
        return
      }

      // Wait for i18next to be initialized
      if (!i18next.isInitialized) {
        await new Promise((resolve) => {
          if (i18next.isInitialized) {
            resolve(undefined)
          } else {
            const handler = () => {
              i18next.off("initialized", handler)
              resolve(undefined)
            }
            i18next.on("initialized", handler)
          }
        })
      }

      // Change language if needed
      if (lang && i18next.language !== lang) {
        await i18next.changeLanguage(lang)
      }

      // Listen for ready event
      if (typeof window !== "undefined") {
        window.addEventListener("i18next:ready", checkReady)
      }

      // Check immediately
      checkReady()
    }

    init()

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("i18next:ready", checkReady)
      }
    }
  }, [lang])

  return { isReady, t }
}
