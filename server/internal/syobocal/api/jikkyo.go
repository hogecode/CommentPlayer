package api

import (
	"fmt"

	"github.com/hogecode/commentPlayer/internal/syobocal/config"
	"github.com/hogecode/commentPlayer/internal/syobocal/models"
)

// GetJikkyoComments fetches comments from Jikkyo API
func (c *Client) GetJikkyoComments(jikkyoID string, startTime, endTime int64) (*models.JikkyoResponse, error) {
	url := fmt.Sprintf("%s/%s", config.JikkyoBaseURL, jikkyoID)

	resp, err := c.R().
		SetQueryParams(map[string]string{
			"starttime": fmt.Sprintf("%d", startTime),
			"endtime":   fmt.Sprintf("%d", endTime),
			"format":    "json",
		}).
		SetResult(&models.JikkyoResponse{}).
		Get(url)

	if err != nil {
		return nil, fmt.Errorf("failed to call Jikkyo API: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("Jikkyo API returned status %d", resp.StatusCode())
	}

	result, ok := resp.Result().(*models.JikkyoResponse)
	if !ok {
		return nil, fmt.Errorf("failed to parse Jikkyo response")
	}

	return result, nil
}
