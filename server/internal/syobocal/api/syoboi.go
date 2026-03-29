package api

import (
	"encoding/xml"
	"fmt"
	"log/slog"

	"github.com/hogecode/commentPlayer/internal/syobocal/config"
	"github.com/hogecode/commentPlayer/internal/syobocal/models"
)

// TitleSearch calls the Syoboi TitleSearch API
func (c *Client) TitleSearch(searchQuery string) (*models.TitleSearchResponse, error) {
	resp, err := c.R().
		SetQueryParams(map[string]string{
			"Req":    "TitleSearch",
			"Search": searchQuery,
			"Limit":  "15",
		}).
		SetResult(&models.TitleSearchResponse{}).
		Get(config.SyoboiTitleSearchURL)

	if err != nil {
		return nil, fmt.Errorf("failed to call TitleSearch API: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("TitleSearch API returned status %d", resp.StatusCode())
	}

	result, ok := resp.Result().(*models.TitleSearchResponse)
	if !ok {
		return nil, fmt.Errorf("failed to parse TitleSearch response")
	}

	return result, nil
}

// ProgLookup calls the Syoboi ProgLookup API
// chIDs can be a single ID (e.g., "1") or multiple IDs (e.g., "1,2,3,4,5,6,7,8,9,10")
func (c *Client) ProgLookup(tid string, chIDs string, count int) (*models.ProgLookupResponse, error) {
	c.logger.Debug("ProgLookup API called",
		slog.String("TID", tid),
		slog.String("ChIDs", chIDs),
		slog.Int("count", count))

	resp, err := c.R().
		SetQueryParams(map[string]string{
			"Command": "ProgLookup",
			"TID":     tid,
			"ChID":    chIDs,
			"Count":   fmt.Sprintf("%d", count),
			"JOIN":    "SubTitles",
		}).
		Get(config.SyoboiProgLookupURL)

	if err != nil {
		return nil, fmt.Errorf("failed to call ProgLookup API: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("ProgLookup API returned status %d", resp.StatusCode())
	}

	// Parse XML response
	var result models.ProgLookupResponse
	if err := xml.Unmarshal(resp.Body(), &result); err != nil {
		c.logger.Error("ProgLookup API response parse failed",
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to parse ProgLookup response: %w", err)
	}

	c.logger.Debug("ProgLookup API completed successfully",
		slog.Int("progItemCount", len(result.ProgItems)))

	return &result, nil
}

// TitleLookup calls the Syoboi TitleLookup API
func (c *Client) TitleLookup(tid string) (*models.TitleLookupResponse, error) {
	c.logger.Debug("TitleLookup API called",
		slog.String("TID", tid))

	// http://cal.syoboi.jp/db?Command=TitleLookup&TID=1853
	resp, err := c.R().
		SetQueryParams(map[string]string{
			"Command": "TitleLookup",
			"TID":     tid,
		}).
		Get(config.SyoboiProgLookupURL)

	if err != nil {
		return nil, fmt.Errorf("failed to call TitleLookup API: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("TitleLookup API returned status %d", resp.StatusCode())
	}

	// Parse XML response
	var result models.TitleLookupResponse
	if err := xml.Unmarshal(resp.Body(), &result); err != nil {
		c.logger.Error("TitleLookup API response parse failed",
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to parse TitleLookup response: %w", err)
	}

	c.logger.Debug("TitleLookup API completed successfully",
		slog.Int("titleItemCount", len(result.TitleItems)))

	return &result, nil
}
