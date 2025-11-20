"""
NLP Model for Grammar and Spell Checking
Uses TextBlob for spell correction and LanguageTool for grammar correction
"""

import os
import shutil
from textblob import TextBlob
import language_tool_python


class NLPModel:
    """
    NLP Model class for text correction
    Handles spell checking with TextBlob and grammar checking with LanguageTool
    """
    
    def __init__(self):
        """
        Initialize the NLP model with Java detection and LanguageTool setup
        """
        self.tool = None
        self._init_language_tool()
    
    def _check_java_installed(self):
        """
        Check if Java is installed on the system
        
        Returns:
            bool: True if Java is installed, False otherwise
        """
        java_path = shutil.which("java")
        return java_path is not None
    
    def _init_language_tool(self):
        """
        Initialize LanguageTool with automatic Java detection and fallback
        
        If Java is installed: Use local LanguageTool instance
        If Java is not installed: Fall back to remote server via LT_SERVER_URL env variable
        """
        try:
            has_java = self._check_java_installed()
            
            if has_java:
                # Use local LanguageTool instance
                print("✓ Java detected - using local LanguageTool instance")
                self.tool = language_tool_python.LanguageTool('en-US')
            else:
                # Fall back to remote server
                remote_url = os.getenv('LT_SERVER_URL')
                if remote_url:
                    print(f"✗ Java not found - using remote LanguageTool server: {remote_url}")
                    self.tool = language_tool_python.LanguageToolPublicAPI('en-US')
                else:
                    print("⚠ Java not found and LT_SERVER_URL not set - using public API")
                    self.tool = language_tool_python.LanguageToolPublicAPI('en-US')
        
        except Exception as e:
            print(f"⚠ Error initializing LanguageTool: {str(e)}")
            # Fallback to public API if local initialization fails
            try:
                self.tool = language_tool_python.LanguageToolPublicAPI('en-US')
                print("✓ Fallback to public LanguageTool API successful")
            except Exception as fallback_error:
                print(f"✗ Fallback failed: {str(fallback_error)}")
                self.tool = None
    
    def spell_correct(self, text):
        """
        Correct spelling errors using TextBlob
        
        Args:
            text (str): Input text with potential spelling errors
            
        Returns:
            str: Text with spelling corrections applied
        """
        try:
            if not text or not isinstance(text, str):
                return text
            
            blob = TextBlob(text)
            corrected = str(blob.correct())
            return corrected
        
        except Exception as e:
            print(f"⚠ Spell correction error: {str(e)}")
            return text  # Return original text if correction fails
    
    def grammar_correct(self, text):
        """
        Correct grammar errors using LanguageTool
        
        Args:
            text (str): Input text with potential grammar errors
            
        Returns:
            str: Text with grammar corrections applied
        """
        try:
            if not text or not isinstance(text, str):
                return text
            
            if self.tool is None:
                print("⚠ LanguageTool not initialized - skipping grammar correction")
                return text
            
            # Get matches and apply corrections
            corrected = self.tool.correct(text)
            return corrected
        
        except Exception as e:
            print(f"⚠ Grammar correction error: {str(e)}")
            return text  # Return original text if correction fails
    
    def correct(self, text, do_spell=True, do_grammar=True):
        """
        Perform spell and/or grammar correction on input text
        
        Args:
            text (str): Input text to correct
            do_spell (bool): Whether to perform spell correction (default: True)
            do_grammar (bool): Whether to perform grammar correction (default: True)
            
        Returns:
            tuple: (spell_corrected_text, final_corrected_text)
                - spell_corrected_text: Text after spell correction only
                - final_corrected_text: Text after both spell and grammar correction
        """
        try:
            if not text or not isinstance(text, str):
                return ("", "")
            
            # Strip whitespace
            text = text.strip()
            
            if not text:
                return ("", "")
            
            # Step 1: Spell correction
            spell_corrected = text
            if do_spell:
                spell_corrected = self.spell_correct(text)
            
            # Step 2: Grammar correction (applied to spell-corrected text)
            final_corrected = spell_corrected
            if do_grammar:
                final_corrected = self.grammar_correct(spell_corrected)
            
            return (spell_corrected, final_corrected)
        
        except Exception as e:
            print(f"⚠ Correction error: {str(e)}")
            return (text, text)  # Return original text if any error occurs
    
    def close(self):
        """
        Clean up resources and close LanguageTool instance
        """
        try:
            if self.tool is not None:
                self.tool.close()
                print("✓ LanguageTool closed successfully")
        except Exception as e:
            print(f"⚠ Error closing LanguageTool: {str(e)}")
