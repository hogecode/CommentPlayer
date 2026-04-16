package api

import (
	"encoding/xml"
	"fmt"

	"github.com/hogecode/commentPlayer/internal/syobocal/config"
	"github.com/hogecode/commentPlayer/internal/syobocal/models"
)

// GetJikkyoCommentsJSON fetches comments from Jikkyo API in JSON format
func (c *Client) GetJikkyoCommentsJSON(jikkyoID string, startTime, endTime int64) (*models.JikkyoResponse, error) {
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

// GetJikkyoCommentsXML fetches comments from Jikkyo API in XML format
// Returns parsed XML packet and raw bytes
func (c *Client) GetJikkyoCommentsXML(jikkyoID string, startTime, endTime int64) (*models.JikkyoPacketXML, []byte, error) {
	url := fmt.Sprintf("%s/%s", config.JikkyoBaseURL, jikkyoID)

	resp, err := c.R().
		SetQueryParams(map[string]string{
			"starttime": fmt.Sprintf("%d", startTime),
			"endtime":   fmt.Sprintf("%d", endTime),
			"format":    "xml",
		}).
		Get(url)

	if err != nil {
		return nil, nil, fmt.Errorf("failed to call Jikkyo API: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, nil, fmt.Errorf("Jikkyo API returned status %d", resp.StatusCode())
	}

	xmlBytes := resp.Body()
	var packet models.JikkyoPacketXML
	if err := xml.Unmarshal(xmlBytes, &packet); err != nil {
		return nil, xmlBytes, fmt.Errorf("failed to unmarshal XML: %w", err)
	}

	return &packet, xmlBytes, nil
}
